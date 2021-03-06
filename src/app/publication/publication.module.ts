import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PreviewModule } from '../preview/preview.module';
import { PublicationComponent } from './publication.component';
import { PublicationDetailComponent } from './publication.detail.component';
import { PublicationReuseComponent } from './publication.reuse.component';
import { PublicationFormComponent } from './publication.form.component';
import { ResponsedomainModule } from '../responsedomain/responsedomain.module';
import { PublicationService } from './publication.service';

@NgModule({
  imports: [ SharedModule, PreviewModule, ResponsedomainModule ],
  declarations: [ PublicationComponent, PublicationDetailComponent, PublicationReuseComponent,
    PublicationFormComponent ],
  exports: [ PublicationComponent ],
  providers: [ PublicationService ]
})

export class PublicationModule { }
