import { Schedule } from './../../models/schedule.model';
import { UserProvider } from './../../providers/user/user';
import { AuthProvider } from './../../providers/auth/auth';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, MenuController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { User } from '../../models/user.model';
import { Observable, Subscription } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';
import { RatingPage } from '../rating/rating';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  users: Observable<User[]>;

  schedules: Observable<Schedule[]>;

  notebook : Observable<Schedule[]>;

  currentUser : User

  unSub: Subscription

  setNote : boolean = false

  title: string = 'Agenda'

  constructor(public navParams: NavParams,
              public db : AngularFireDatabase,
              public userProvider : UserProvider,
              public authProvider: AuthProvider,
              public navCtrl: NavController,
              public menuCtrl: MenuController,
              public cd: ChangeDetectorRef,
              public alertCtrl : AlertController,
              public modalCtrl: ModalController)
  {

  }

  ionViewCanEnter () : Promise<boolean>{
    return this.authProvider.authenticated;
  }
  ionViewWillEnter(){
    if(this.notebook){
      this.unSub = this.notebook.subscribe(
        value => {
          if(value.length != 0){
            this.setNote = true
          }
        }
      )
      setTimeout(() :void => {this.unSub.unsubscribe()},400)
    }
  }
  ionViewWillLeave(){
    this.unSub.unsubscribe()
  }

  ionViewDidLoad(){
    this.userProvider.mapObjectKey<User>(this.userProvider.currentUser).first().subscribe((currentUser: User) => {
      this.notebook = this.db.list<Schedule>(`/notebook/${currentUser.id}`).valueChanges();
      this.unSub = this.notebook.subscribe(
        value => {
          if(value.length != 0){
            this.setNote = true
          }
        }
      )
      setTimeout(() :void => {this.unSub.unsubscribe()},400)
    });
    this.users = this.userProvider.users;

    this.userProvider.mapObjectKey<User>(this.userProvider.currentUser).first().subscribe((currentUser: User) => {
      this.schedules = this.db.list<Schedule>(`/schedules/${currentUser.id}`).valueChanges();
    });


    this.menuCtrl.enable(true)
  }

  rate (idIndependent) : void {
    console.log(idIndependent)
    let rateModal = this.modalCtrl.create(RatingPage, { id : idIndependent }, {enableBackdropDismiss: true});
    rateModal.present();
  }

  onModelChange(event, independentId) : void {
    console.log(event)
    console.log(independentId)
  }

}
/*

{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users":{
      ".read": true,
    	".write": true
    }
  }
}*/
