import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable, from, mergeMap } from "rxjs";
import { NodeApiService } from "./node-api.service";


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private apiService: NodeApiService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.apiService.getToken('token')).pipe(
            mergeMap((token) => {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            })
            return next.handle(authReq);  
        }))
    }
}