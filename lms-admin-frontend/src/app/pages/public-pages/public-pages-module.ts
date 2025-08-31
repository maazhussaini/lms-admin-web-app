import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PublicPagesRoutingModule } from './public-pages-routing-module';
import { PublicPageLayout } from './public-page-layout/public-page-layout';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ResetPassword } from './auth/reset-password/reset-password';


@NgModule({
  declarations: [
    PublicPageLayout,
    SignIn,
    SignUp,
    ForgotPassword,
    VerifyOtp,
    ResetPassword
  ],
  imports: [
    CommonModule,
    FormsModule,
    PublicPagesRoutingModule
  ]
})
export class PublicPagesModule { }
