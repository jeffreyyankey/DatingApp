import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  baserUrl = environment.apiUrl;
  members = signal<Member[]>([]);

  getMembers() {
    return this.http.get<Member[]>(this.baserUrl + 'users').subscribe({
      next: members => this.members.set(members)
    })
  }

  getMember(username: string) {

    const member = this.members().find(x => x.username === username);
    if (member !== undefined) return of(member);

    return this.http.get<Member>(this.baserUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baserUrl + 'users', member).pipe(
      tap(() => {
        this.members.update(members => members.map(m => m.username === member.username ? member : m));
      })
    )
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(this.baserUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if (m.photos.includes(photo)) {
            m.photoUrl = photo.url;
          }
          return m;
        }))
      })
    )
  }

  deletePhoto(photo: Photo) {
    return this.http.delete(this.baserUrl + 'users/delete-photo/' + photo.id).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if (m.photos.includes(photo)) {
            m.photos = m.photos.filter(p => p.id !== photo.id);
          }
          return m;
        }))
      }
    ) 
  )}
}
