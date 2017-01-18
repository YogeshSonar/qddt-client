import { Component, OnInit, AfterContentChecked, EventEmitter } from '@angular/core';

import { QuestionService, QuestionItem, Question } from './question.service';
import { UserService } from '../../common/user.service';
import { Subject }          from 'rxjs/Subject';

@Component({
  selector: 'question',
  moduleId: module.id,
  templateUrl: './question.component.html',
  providers: [QuestionService]
})

export class QuestionComp implements AfterContentChecked, OnInit {

  showQuestionItemForm: boolean = false;
  showResponsedomainReuse: boolean = false;
  actions = new EventEmitter<any>();
  error: string;
  responseDomainAction = new EventEmitter<string>();
  previewResponseDomain: any;

  private questionitems: any;
  private page: any;
  private questionItem: any;
  private selectedQuestionItem: any;
  private isDetail: boolean;
  private columns: any[];
  private searchKeysSubect: Subject<string> = new Subject<string>();
  private searchKeys: string;
  private secondCS: any;
  private mainresponseDomainRevision: number;

  constructor(private questionService: QuestionService, private userService: UserService) {
    this.isDetail = false;
    this.questionitems = [];
    this.page = {};
    this.searchKeys = '';
    this.secondCS = null;
    this.mainresponseDomainRevision = 0;
    this.columns = [{'name':['question','question'], 'label':'Question Text', 'sortable':true, 'direction': '' }
      ,{'name':'name', 'label':'Question Name', 'sortable':false, 'direction': '' }
      ,{'name':['responseDomain','name'], 'label':'ResponseDomain Name', 'sortable':true, 'direction': '' }];
    this.searchKeysSubect
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe((name: string) => {
        this.questionService.searchQuestionItemsByNameAndQuestion(name, '0', this.getSort()).subscribe((result: any) => {
          this.page = result.page;
          this.questionitems = result.content;
        });
      });
  }

  ngOnInit() {
    let config = this.userService.getGlobalObject('questions');
    if (config.current === 'detail' ) {
      this.page = config.page;
      this.questionitems = config.collection;
      this.selectedQuestionItem = config.item;
      this.isDetail = true;
    } else {
      this.questionService.getQuestionItemPage().subscribe(
      (result: any) => { this.page = result.page; this.questionitems = result.content; });
    }
  }

  ngAfterContentChecked() {
    let config = this.userService.getGlobalObject('questions');
    if (config.current === 'detail' ) {
      this.page = config.page;
      this.questionitems = config.collection;
      this.selectedQuestionItem = config.item;
      this.isDetail = true;
    } else {
      this.isDetail = false;
    }
  }

  onEditMissing(missing: any) {
    this.secondCS = missing;
    this.buildPreviewResponseDomain();
    return false;
  }

  onToggleQuestionItemForm() {
    this.showQuestionItemForm = !this.showQuestionItemForm;
    if (this.showQuestionItemForm) {
      this.questionItem = new QuestionItem();
      this.questionItem.question = new Question();
      this.secondCS = null;
      this.questionItem.responseDomain = null;
    }
  }

  onDetail(questionItem: any) {
    this.selectedQuestionItem = questionItem;
    this.isDetail = true;
    this.userService.setGlobalObject('questions',
      {'current': 'detail',
        'page': this.page,
        'item': this.selectedQuestionItem,
        'collection': this.questionitems});
  }

  hideDetail() {
    this.isDetail = false;
    this.userService.setGlobalObject('questions', {'current': 'list'});
  }

  onPage(page: string) {
    this.questionService.searchQuestionItems(this.searchKeys, page, this.getSort()).subscribe(
      (result: any) => { this.page = result.page; this.questionitems = result.content; });
  }

  onCreateQuestionItem() {
    this.showQuestionItemForm = false;
    this.questionItem.question.name = this.questionItem.name;
    if (this.secondCS === null) {
      this.questionItem.responseDomainRevision = this.mainresponseDomainRevision;
      this.questionService.createQuestionItem(this.questionItem)
        .subscribe((result: any) => {
          this.questionitems = [result].concat(this.questionitems);
        }, (err: any) => { this.error = err.toString(); this.actions.emit('openModal'); });
    } else {
      this.questionItem.responseDomainRevision = 0;
      this.createMixedCategory().subscribe((result: any) => {
        this.createMixedResponseDomain(result).subscribe((result: any) => {
          this.questionItem.responseDomain = result;
          this.questionService.updateQuestionItem(this.questionItem)
            .subscribe((result: any) => {
              this.questionitems = [result].concat(this.questionitems);
            }, (err: any) => { this.error = err.toString(); this.actions.emit('openModal'); });
        }, (err: any) => { this.error = err.toString(); this.actions.emit('openModal'); });
      }, (err: any) => { this.error = err.toString(); this.actions.emit('openModal'); });
    }
    this.isDetail = false;
  }

  responseDomainReuse(item: any) {
    this.questionItem.responseDomain = item.responseDomain;
    this.mainresponseDomainRevision = item.responseDomainRevision;
    this.showResponsedomainReuse = false;
    this.buildPreviewResponseDomain();
    this.responseDomainAction.emit('closeModal');
  }

  openResponseDomainModal() {
    this.showResponsedomainReuse = true;
    this.responseDomainAction.emit('openModal');
  }

  searchResponseDomains(name: string) {
    this.searchKeys = name;
    this.searchKeysSubect.next(name);
  }

  private getSort() {
    let i = this.columns.findIndex((e: any) => e.sortable && e.direction !== '');
    let sort = '';
    if (i >= 0) {
      if (typeof this.columns[i].name === 'string') {
        sort = this.columns[i].name + ',' + this.columns[i].direction;
      } else {
        sort = this.columns[i].name.join('.') + ',' + this.columns[i].direction;
      }
    }
    return sort;
  }

  private createMixedCategory() {
    let rep = {};
    rep['categoryType'] = 'MIXED';
    rep['hierarchyLevel'] = 'GROUP_ENTITY';
    rep['name'] = rep['description'] = 'mixed category';
    rep['children'] = [];
    if (this.questionItem.responseDomain !== null
      && this.questionItem.responseDomain !== undefined) {
      rep['children'].push(this.questionItem.responseDomain['managedRepresentation']);
    }
    if (this.secondCS !== null && this.secondCS !== undefined) {
      rep['children'].push(this.secondCS);
    }
    return this.questionService.createCategory(rep);
  }

  private createMixedResponseDomain(result: any) {
    let rd: any = {};
    rd['responseKind'] = 'MIXED';
    rd['description'] = '';
    let mainResponseDomain = this.questionItem.responseDomain;
    rd['name'] = (mainResponseDomain.name || ' ') + ' + ' + this.secondCS.name;
    rd['managedRepresentation'] = result;
    rd['displayLayout'] = mainResponseDomain['displayLayout'];
    let representation = rd['managedRepresentation'];
    for (let i = 0; i < representation.children.length; i++) {
      let category = representation.children[i];
      if (representation.children[i].categoryType === 'MISSING_GROUP') {
        for (let i = 0; i < category.children.length; i++) {
          category.children[i].code = this.secondCS.children[i].code;
        }
      } else {
        for (let i = 0; i < category.children.length; i++) {
          category.children[i].code = mainResponseDomain['managedRepresentation'].children[i].code;
        }
      }
    }
    return this.questionService.createResponseDomain(rd);
  }

  private buildPreviewResponseDomain() {
    if (this.secondCS !== null) {
      this.previewResponseDomain = {};
      this.previewResponseDomain['responseKind'] = 'MIXED';
      let rep = {};
      rep['categoryType'] = 'MIXED';
      rep['hierarchyLevel'] = 'GROUP_ENTITY';
      rep['name'] = rep['description'] = 'mixed category';
      rep['children'] = [];
      if (this.questionItem.responseDomain !== null
        && this.questionItem.responseDomain !== undefined) {
        rep['children'].push(this.questionItem.responseDomain['managedRepresentation']);
      }
      if (this.secondCS !== null && this.secondCS !== undefined) {
        rep['children'].push(this.secondCS);
      }
      this.previewResponseDomain['managedRepresentation'] = rep;
      this.previewResponseDomain['responseCardinality'] = this.questionItem.responseDomain.responseCardinality;
      this.previewResponseDomain['displayLayout'] = this.questionItem.responseDomain.displayLayout;
    } else {
      this.previewResponseDomain = this.questionItem.responseDomain;
    }
  }
}
