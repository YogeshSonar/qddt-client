import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { CategoryService, Category } from './category.service';
import { Subject } from 'rxjs/Subject';
import { PropertyStoreService } from '../core/global/property.service';
import { Column } from '../shared/table/table.column';

@Component({
  selector: 'qddt-category',
  moduleId: module.id,
  templateUrl: './category.component.html',
})

export class CategoryComponent implements OnInit, AfterContentChecked {

  public isDetail: boolean;
  public showCategoryForm = false;
  public categories: any;
  public selectedCategory: any;

  private page: any;
  private category: any;
  private searchKeys: string;
  private columns: Column[];
  private searchKeysSubect: Subject<string> = new Subject<string>();

  constructor(private categoryService: CategoryService, private property: PropertyStoreService) {
    this.isDetail = false;
    this.categories = [];
    this.searchKeys = '';
    this.page = {};
    this.columns = [
      { label: 'Label', name: 'label', sortable: true, direction: ''},
      { label: 'Description', name: 'description', sortable: true, direction: '' },
      { label: 'Type', name: 'categoryType', sortable: true, direction: '' },
      { label: 'Modified', name: 'modified', sortable: true, direction: 'desc'} ];
    this.searchKeysSubect
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe((name: string) => {
        this.categoryService.getAllByLevel('ENTITY', name, this.getSort())
        .then((result: any) => {
          this.page = result.page;
          this.categories = result.content;
        });
      });
  }

  ngOnInit() {
    const config = this.property.get('categories');
    if (config.current === 'detail' ) {
      this.page = config.page;
      this.categories = config.collection;
      this.selectedCategory = config.item;
      this.isDetail = true;
    } else {
      this.categoryService.getByCategoryKind('CATEGORY', '*', '0', this.getSort())
      .then((result: any) => {
         this.page = result.page;
         this.categories = result.content;
        });
    }
  }

  ngAfterContentChecked() {
    const config = this.property.get('categories');
    if (config.current === 'detail' ) {
      this.page = config.page;
      this.categories = config.collection;
      this.selectedCategory = config.item;
      this.searchKeys = config.key;
      this.isDetail = true;
    } else {
      this.isDetail = false;
      if (config.key === null || config.key === undefined) {
        this.property.set('categories', {'current': 'list', 'key': ''});
        this.searchKeys = '';
        this.searchKeysSubect.next('');
      }
    }
  }

  onToggleCategoryForm() {
    this.showCategoryForm = !this.showCategoryForm;
    if (this.showCategoryForm) {
      this.category = new Category();
    }
  }

  onHideDetail() {
    this.isDetail = false;
    this.property.set('categories', {'current': 'list', 'key': this.searchKeys});
  }

  onCreateCategory() {
    this.showCategoryForm = false;
    this.categoryService.save(this.category)
      .subscribe((result: any) => {
        this.categories = [result].concat(this.categories);
      });
    this.isDetail = false;
  }

  onTableSearchCategories(name: string) {
    this.searchKeys = name;
    this.searchKeysSubect.next(name);
  }

  onTablePage(page: string) {
    this.categoryService.getAllByLevelAndPage('ENTITY', this.searchKeys, page, this.getSort())
    .then((result: any) => {
      this.page = result.page;
      this.categories = result.content;
    });
  }

  onTableDetail(category: any) {
    this.selectedCategory = category;
    this.isDetail = true;
    this.property.set('categories',
      {'current': 'detail',
        'page': this.page,
        'key': this.searchKeys,
        'item': this.selectedCategory,
        'collection': this.categories});
  }

  private getSort() {
    const i = this.columns.findIndex((e: any) => e.sortable && e.direction !== '');
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
}
