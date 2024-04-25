import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user.model";
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiPath: string = "/api"
  constructor(private httpClient: HttpClient) {
  }
  getUsers() {
    return this.httpClient.get<User[]>(this.apiPath+ '/users');
  }

  fetchUsers(): Observable<any> {
    return interval(1000) // Periodically emit a value every 1 second
      .pipe(
        switchMap(() => this.getUsers())
      );
  }

}
