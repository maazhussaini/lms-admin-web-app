import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicPageLayout } from './public-page-layout/public-page-layout';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';
import { VerifyOtp } from './auth/verify-otp/verify-otp';
import { ResetPassword } from './auth/reset-password/reset-password';
import { ForgotPassword } from './auth/forgot-password/forgot-password';

const routes: Routes = [
  {
    path: '',
    component: PublicPageLayout,
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
      {
        path: 'sign-in',
        component: SignIn
      },
      {
        path: 'sign-up',
        component: SignUp
      },
      {
        path: 'sign-up',
        component: SignUp
      },
      {
        path: 'forgot-password',
        component: ForgotPassword
      },
      {
        path: 'verify-otp',
        component: VerifyOtp
      },
      {
        path: 'reset-password',
        component: ResetPassword
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicPagesRoutingModule { }
