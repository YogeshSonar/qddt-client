import {Component, Inject, Input} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {LoginComponent} from '../login/login';
import {UserService} from '../../common/userservice';
import {SurveyProgramComponent} from '../surveyprogram/surveyprogram';
import {SurveyProgram} from '../surveyprogram/surveyservice';
import {CommitListComponent} from '../github/commit_list';
import {AgencyComponent} from '../agency/agency';
import {StudyComponent} from '../study/study';
import {SurveyProgram} from '../surveyprogram/surveyservice';

@Component({
  selector: 'home',
  templateUrl: './components/home/home.html',
  styleUrls: ['./components/home/home.css'],
  directives: [
    ROUTER_DIRECTIVES,
    LoginComponent,
    SurveyProgramComponent,
    CommitListComponent,
    StudyComponent
  ]
})
export class HomeCmp {

  surveyProgram: any;
  user: string;

  constructor(private userService: UserService) {

  }

  ngAfterContentChecked() {
    this.user = this.userService.get();
  }

  loginEvent() {
    this.user = this.userService.get();
  }

  surveyCreateEvent(surveyProgram: any) {
    this.surveyProgram = surveyProgram;
  }
}
