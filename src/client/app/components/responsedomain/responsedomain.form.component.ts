import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Change } from '../../common/change_status';
import { CategoryService, Category, ResponseCardinality } from '../category/category.service';
import { DomainType, DomainTypeDescription } from './responsedomain.constant';
import { Observable }     from 'rxjs/Observable';

@Component({
  selector: 'responsedomain-form',
  moduleId: module.id,
  templateUrl: './responsedomain.form.component.html',
  styles: [
    `.noItemFound {
        border: thick solid red;
    }`
  ],
  providers: [CategoryService],
})

export class ResponsedomainFormComponent implements OnInit {
  @Input() responsedomain: any;
  @Input() domainType: DomainType;
  @Output() formChange: EventEmitter<any>;

  public domainTypeDef = DomainType;
  private categories: any;
  private _ChangeEnums: any;
  private codes: string[];
  private selectedCategoryIndex: number;
  private suggestions: Category[];
  private numberOfAnchors: number;

  constructor(private categoryService: CategoryService) {
    this._ChangeEnums = Change.status;
    this.codes = [];
    this.selectedCategoryIndex = 0;
    this.formChange = new EventEmitter<any>();
    this.numberOfAnchors = 0;
  }

  ngOnInit() {
    if(this.responsedomain.responseCardinality === undefined) {
      this.responsedomain.responseCardinality = { 'minimum': 1, 'maximum': 1 };
    }
    if (this.responsedomain.managedRepresentation === undefined) {
      this.responsedomain.managedRepresentation = new Category();
    }
    if (this.responsedomain.managedRepresentation.inputLimit === undefined) {
      this.responsedomain.managedRepresentation.inputLimit = new ResponseCardinality();
      this.responsedomain.managedRepresentation.inputLimit = { 'minimum': 1, 'maximum': 1 };
    }
    if (this.responsedomain.managedRepresentation.children === undefined) {
      this.responsedomain.managedRepresentation.children = [];
    }
    if (this.domainType === DomainType.SCALE) {
      this.responsedomain.managedRepresentation.categoryType = 'SCALE';
      this.numberOfAnchors = this.responsedomain.managedRepresentation.children.length;
    } else if (this.domainType === DomainType.NUMERIC) {
      this.responsedomain.managedRepresentation.categoryType = 'NUMERIC';
    } else if (this.domainType === DomainType.TEXT) {
      this.responsedomain.managedRepresentation.categoryType = 'TEXT';
    } else {
      this.responsedomain.managedRepresentation.categoryType = 'LIST';
      this.numberOfAnchors = this.responsedomain.managedRepresentation.children.length;
    }
    if (this.domainType === DomainType.SCALE) {
      if(typeof this.responsedomain.displayLayout === 'string') {
        this.responsedomain.displayLayout = parseInt(this.responsedomain.displayLayout);
      }
      if (this.responsedomain.displayLayout !== 90) {
        this.responsedomain.displayLayout = 0;
      }
    }
    if (this.domainType === DomainType.SCALE || this.domainType === DomainType.LIST) {
      let categoryType = DomainTypeDescription.find((e: any)=>e.id === this.domainType).categoryType;
      this.categoryService.getAllTemplatesByCategoryKind(categoryType)
        .subscribe((result: any) => this.suggestions = result.content);
    } else {
      let categoryType = DomainTypeDescription.find((e: any)=>e.id === this.domainType).categoryType;
      this.categoryService.getByCategoryKind(categoryType, '')
        .subscribe((result: any) => this.suggestions = result.content);
    }
    this.categoryService.getAllByLevel('ENTITY').subscribe((result: any) => {
      this.categories = result.content;
    });
  }

  select(candidate: any) {
    candidate.code = this.responsedomain.managedRepresentation.children[this.selectedCategoryIndex].code;
    this.responsedomain.managedRepresentation.children[this.selectedCategoryIndex] = candidate;
  }

  save() {
    this.responsedomain.label = this.responsedomain.name;
    let category = this.responsedomain.managedRepresentation;
    let source = Observable.range(0, category.children.length)
      .flatMap((x: any) => {
        let c = category.children[x];
        if (c.isNew === true) {
          c.name = c.label;
          return this.categoryService.save(c);
        } else {
          return Observable.of(c);
        }
      });

    let index = 0;
    let changeEvent = this.formChange;
    let rd = this.responsedomain;
    let service = this.categoryService;

    source.subscribe(
      function (x: any) {
        if (index < category.children.length) {
          category.children[index] = x;
          index = index + 1;
        }
      },
      function (err: any) {
        console.log('Error: %s', err);
      },
      function () {
        if (category.id !== undefined && category.id !== '') {
          changeEvent.emit(rd);
        } else {
          category.name = 'category scheme for ' + rd.name;
          service.save(category)
            .subscribe((result: any) => {
              for (let i = 0; i < category.children.length; i++) {
                result.children[i].code = category.children[i].code;
              }
              rd.managedRepresentation = result;
              changeEvent.emit(rd);
            });
        }
      });
  }

  changeNumberOfCategories(num: number) {
    this.responsedomain.managedRepresentation.inputLimit.maximum  = num;
    this.changeNumberOfAnchors(num);
  }

  changeNumberOfAnchors(num: number) {
    let rep = this.responsedomain.managedRepresentation;
    if(rep.children.length === num) {
      return;
    }
    let count = rep.inputLimit.maximum - rep.inputLimit.minimum + 1;
    if (count < num) {
      this.numberOfAnchors = count;
    } else if (num < 0) {
      this.numberOfAnchors = 0;
    } else {
      this.numberOfAnchors = num;
    }

    if (this.domainType === DomainType.LIST) {
      rep.children = rep.children.slice(0, this.numberOfAnchors);
      for (let i = rep.children.length; i < this.numberOfAnchors; i++) {
        let c = new Category();
        c.code = { codeValue: String(i + 1) };
        rep.children.push(c);
      }
    } else if (this.domainType === DomainType.SCALE) {
      rep.children = rep.children.slice(0, this.numberOfAnchors);
      let len = rep.children.length;
      for (let i = 0; i < this.numberOfAnchors; i++) {
        if(i >= len) {
          let c = new Category();
          c.code = { codeValue: '' };
          rep.children.push(c);
        } else {
          rep.children[i].code.codeValue = '';
        }
      }
    }
  }

  searchCategories(name: string) {
    this.responsedomain.managedRepresentation.children[this.selectedCategoryIndex].isNew = true;
    this.responsedomain.managedRepresentation.children[this.selectedCategoryIndex].label = name;
    this.categoryService.getAllByLevel('ENTITY', name).subscribe((result: any) => {
      this.categories = result.content;
    });
  }

  onClickClear(idx: number) {
    let rep = this.responsedomain.managedRepresentation;
    if (this.domainType === DomainType.LIST) {
      if ( idx < rep.children.length) {
        let c = new Category();
        c.code = rep.children[idx].code;
        rep.children[idx] = c;
      }
    }
  }

  onClickUp(idx: number) {
    let rep = this.responsedomain.managedRepresentation;
    if (this.domainType === DomainType.LIST) {
      if ( idx < rep.children.length && idx > 0) {
        let prev = rep.children[idx - 1];
        let curr = rep.children[idx];
        let code = curr.code;
        curr.code = prev.code;
        rep.children[idx - 1] = curr;
        prev.code = code;
        rep.children[idx] = prev;
      }
    }
  }

  onClickDown(idx: number) {
    let rep = this.responsedomain.managedRepresentation;
    if (this.domainType === DomainType.LIST) {
      if ( idx < (rep.children.length - 1) && idx >= 0) {
        let next = rep.children[idx + 1];
        let curr = rep.children[idx];
        let code = curr.code;
        curr.code = next.code;
        rep.children[idx + 1] = curr;
        next.code = code;
        rep.children[idx] = next;
      }
    }
  }

  onChangeDegreeSlope(degree: any) {
    if(typeof degree === 'string') {
      this.responsedomain.displayLayout = parseInt(degree);
    } else {
      this.responsedomain.displayLayout = degree;
    }
  }
}
