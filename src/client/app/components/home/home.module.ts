import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';

import { CommitListComponent } from '../github/github.commit.list.component';
import { SharedModule } from '../../shared/shared.module';
import { SurveyModule } from '../surveyprogram/survey.module';
import { StudyModule } from '../study/study.module';
import { TopicModule } from '../topic/topic.module';
import { ConceptModule } from '../concept/concept.module';

@NgModule({
    imports: [ SharedModule, SurveyModule, StudyModule, TopicModule, ConceptModule ],
    declarations: [HomeComponent, CommitListComponent],
    exports: [HomeComponent]
})

export class HomeModule { }
