import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivatePagesRoutingModule } from './private-pages-routing-module';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';



@NgModule({
  declarations: [
    PrivatePageLayout
  ],
  imports: [
    CommonModule,
    PrivatePagesRoutingModule
  ]
})
export class PrivatePagesModule { }
