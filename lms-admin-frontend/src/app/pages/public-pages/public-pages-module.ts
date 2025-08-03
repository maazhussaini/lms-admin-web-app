import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicPagesRoutingModule } from './public-pages-routing-module';
import { PublicPageLayout } from './public-page-layout/public-page-layout';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';


@NgModule({
  declarations: [
    PublicPageLayout,
    SignIn,
    SignUp
  ],
  imports: [
    CommonModule,
    PublicPagesRoutingModule
  ]
})
export class PublicPagesModule { }
