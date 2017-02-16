import { Injectable } from 'angular2/core';
import { Http, Response, Jsonp, URLSearchParams } from 'angular2/http';
import { Headers, RequestOptions } from 'angular2/http';
@Injectable()
export class ConfigService {
    constructor(private jsonp: Jsonp, private http: Http) { }
    HttpURL: string = "http://xx.xxx.xxx.xx:<portnumber>/";

// Calls the API  given in parameters
FetchData(Weburl: string): Promise <any> {
    Weburl = this.HttpURL + Weburl;		
    let params = new URLSearchParams();
    params.set('search', '');
    params.set('action', '');
    params.set('format', 'json');
    params.set('callback', 'JSONP_CALLBACK');
    return this.jsonp
        .get(Weburl, { search: params })
        .map(request => <any>request.json()).toPromise();
}
    //Retreives data from given CC url
    CCAPIGet(Weburl: string, AccessToken: string):Promise<any> {

		var storeToken: any;
		var logError: any;
		var headers = new Headers();
		headers.append('Accept', 'application/json');
		headers.append('Authorization', 'Bearer ' + AccessToken);

		return this.http
			.get(Weburl, { headers: headers })
			.map(request => <any>request.json()).toPromise();
	}
    //Posts data to given CC url
    CCAPIPost(body: any, Weburl: string, AccessToken: string): Promise<any> {

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append("Authorization", 'Bearer ' + AccessToken);
        return this.http.post(Weburl,JSON.stringify(body), { headers: headers })
            .map(response => response.json()).toPromise();

    }
    //Authenticating CC with the given username and password
    CCauthenticate(username: string, password: string): Promise<any> {
        var storeToken: any;
        var logError: any;
        var body = '';//`username=${username}&password=${password}`;
        body = 'grant_type=password&username=' + username + '&password=' + password + ''
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http.post('https://manage.getcloudcherry.com/api/LoginToken', body, { headers: headers })
            .map(response => response.json()).toPromise();
    }
}
