import { Component, EventEmitter, OnInit } from '@angular/core';

import { ControlConstructService, ControlConstruct, Instruction } from './controlconstruct.service';

@Component({
  selector: 'qddt-controle-construct',
  moduleId: module.id,
  templateUrl: './controlconstruct.component.html',
  styles: [
    `.noItemFound {
        border: thick solid red;
    }`
  ],
  providers: [ControlConstructService],
})
export class ControlConstructComponent implements OnInit {

  showControlConstructForm: boolean = false;
  actions = new EventEmitter<string>();
  questionitemActions = new EventEmitter<string>();
  error: any;
  editQuestoinItem: boolean;
  questionItems: any[];
  selectedQuestionItem: any;

  private controlConstructs: any[];
  private page: any;
  private controlConstruct: any;
  private instruction: any;
  private searchKeys: string;
  private selectedControlConstruct: any;
  private isDetail: boolean;
  private columns: any[];
  private showInstructionForm: boolean;
  private instructions: any[];
  private isInstructionAfter: boolean;
  private isInstructionNew: boolean;
  private files: FileList;

  constructor(private service: ControlConstructService) {
    this.isDetail = false;
    this.controlConstructs = [];
    this.searchKeys = '';
    this.page = {};
    this.editQuestoinItem = false;
    this.questionItems = [];
    this.columns = [{ 'label': 'Construct Name', 'name': 'name', 'sortable': true },
      { 'label': 'Question Text', 'name': ['questionItem', 'question', 'question'], 'sortable': false }];
    this.showInstructionForm = false;
    this.instructions = [];
  }

  ngOnInit() {
    this.searchQuestionItems('');
  }

  onToggleControlConstructForm() {
    this.showControlConstructForm = !this.showControlConstructForm;
    if (this.showControlConstructForm) {
      this.controlConstruct = new ControlConstruct();
      this.controlConstruct.preInstructions = [];
      this.controlConstruct.postInstructions = [];
      this.controlConstruct.questionItemRevision = 0;
      this.controlConstruct.questionItem = null;
      this.files = null;
    }
  }

  onToggleInstructionForm() {
    this.showInstructionForm = !this.showInstructionForm;
    if (this.showInstructionForm) {
      this.instruction = new Instruction();
      this.isInstructionAfter = false;
      this.isInstructionNew = false;
      this.instruction.description = '';
    }
  }

  onAddInstruction() {
    if (this.isInstructionAfter) {
      this.controlConstruct.postInstructions.push(this.instruction);
    } else {
      this.controlConstruct.preInstructions.push(this.instruction);
    }
    this.showInstructionForm = false;
  }

  onDeletePreInstruction(id: number) {
    this.controlConstruct.preInstructions.splice(id, 1);
  }

  onDeletePostInstruction(id: number) {
    this.controlConstruct.postInstructions.splice(id, 1);
  }

  onDetail(category: any) {
    this.selectedControlConstruct = category;
    this.isDetail = true;
  }

  hideDetail() {
    this.isDetail = false;
  }

  onPage(page: string) {
    console.log(page);
  }

  onCreateControlConstruct() {
    this.showControlConstructForm = false;
    this.service.create(this.controlConstruct)
      .subscribe((result: any) => {
        if (this.files !== null) {
          this.service.uploadFile(result.id, this.files)
            .subscribe((file: any) => {
              result['otherMaterials'].push(file);
              this.controlConstructs = [result].concat(this.controlConstructs);
            }, (error: any) => {
              this.popupModal('The backend has not supported uploading files yet.');
            });
        } else {
          this.controlConstructs = [result].concat(this.controlConstructs);
        }
      }, (error: any) => {
        this.popupModal(error);
      });
    this.isDetail = false;
  }

  searchControlConstructs(key: string) {
    console.log(key);
  }

  searchQuestionItems(key: string) {
    this.service.searchQuestionItemsByNameAndQuestion(key).subscribe((result: any) => {
      this.questionItems = result.content;
    },
      (error: any) => { this.popupModal(error); });
  }

  onRemoveQuestoinItem() {
    this.controlConstruct.questionItem = null;
    this.editQuestoinItem = false;
  }

  onSelectQuestionItem(questionItem: any) {
    this.selectedQuestionItem = questionItem;
    this.service.getControlConstructsByQuestionItem(questionItem.id).subscribe((result: any) => {
      this.controlConstructs = result;
    },
      (error: any) => { this.popupModal(error); });
  }

  onUploadFile(filename: any) {
    this.files = filename.target.files;
  }

  onClickQuestionItem() {
    this.questionitemActions.emit('openModal');
  }

  onSearchInstructions(key: string) {
    this.instruction.description = key;
    this.service.searchInstructions(key).subscribe((result: any) => {
      this.instructions = result.content;
      this.isInstructionNew = this.instructions.length === 0;
    },
      (error: any) => { this.popupModal(error); });
  }

  onSelectInstruction(instruction: any) {
    this.instruction = instruction;
  }

  popupModal(error: any) {
    this.error = error;
    this.actions.emit('openModal');
  }
}
