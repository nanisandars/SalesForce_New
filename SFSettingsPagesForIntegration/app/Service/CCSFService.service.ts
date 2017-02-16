import { Injectable } from 'angular2/core';
import { Http, Response, Jsonp,URLSearchParams } from 'angular2/http';
import { Headers, RequestOptions } from 'angular2/http';
import { ConfigService } from './Config.service';
@Injectable()
export class CCSFService {
	constructor(private jsonp: Jsonp, private http: Http, private config:ConfigService) { }

	APIendpoint: string = '/api/Connect2SF';//'/api/CCTOSF';//
	IntegrationKey: string = 'integrations.salesforce';
	//Connecting to SF using all credentials
	Connect2SF(ClientID: string, ConsumerSecret: string, UserName: string, Password: string) {

		let Weburl = this.config.HttpURL + this.APIendpoint + '/GetTokenbyauthentication?ClientId=' + ClientID + '&ConsumerSecret=' + ConsumerSecret + '&UserName=' + UserName + '&Password=' + Password + '';
		return this.FetchData(Weburl);
	}
	//Connecting to SF using Refresh token
	ConnectNRetrieveQidsNfields(Rtoken: string) {

		let Weburl =this.config.HttpURL + this.APIendpoint + '/ConnectNRetrieveQidsNfields?Rtoken=' + Rtoken + '';
		return this.FetchData(Weburl);
	}


	//Get CC-SF Mappings
	GetInsertMapping(CCtoken: string, userName: string) {

		let Weburl = '';
		Weburl =this.config.HttpURL + this.APIendpoint + '/GetInsertMapping?CCAccesstoken=' + CCtoken + '&username=' + userName;
		return this.FetchData(Weburl);
	}

	//Insert CC-SF Mappings
	AddInsertMapping(Qid: string, Field: string, CCtoken: string, ccUsername: string) {

		let Weburl = '';
		Weburl =this.config.HttpURL + this.APIendpoint + '/AddInsertMapping?tagName=' + Qid + '&Field=' + Field + '&CCAccesstoken=' + CCtoken + '&noneditable=' + (1 == 0) + '&ccUserName=' + ccUsername;
		return this.FetchData(Weburl);
	}
	//Update CC-SF Mappings
	EditInsertMapping(Qid: string, Field: string, id: Number, CCtoken: string, ccUsername: string) {

		let Weburl = '';
		Weburl =this.config.HttpURL + this.APIendpoint + '/EditInsertMapping?tagname=' + Qid + '&Field=' + Field + '&_id=' + id + '&CCAccesstoken=' + CCtoken + '&noneditable=' + (1 == 0) + '&ccUserName=' + ccUsername;
		return this.FetchData(Weburl);
	}
	//Diable or enable CC-SF Mappings
	EnableDisableInsertMapping(id: string, CCtoken: string, ccUserName: string) {

		let Weburl = '';
		Weburl =this.config.HttpURL + this.APIendpoint + '/EnableDisableInsertMapping?_id=' + id + '&CCAccesstoken=' + CCtoken + '&ccUserName=' + ccUserName;
		return this.FetchData(Weburl);
	}

	//Connect to SF account
	connect2SFAccount(ClientId: string, ConsumerSecret: string, ccUserName: string, ccApiKey: string) {

		let Weburl = '';
		Weburl =this.config.HttpURL + '/api/CCTOSF' + '/connectToSFAccount?sfClientId=' + ClientId + '&sfSecret=' + ConsumerSecret + '&ccUserName=' + ccUserName + '&ccApiKey=' + ccApiKey + '&sfRefreshToken=' + '';


		return this.FetchData(Weburl);
	}



	//Verifying if Refresh Token
	IsRtokenexist(userName: string) {
		let Weburl = '';
		Weburl =this.config.HttpURL + '/api/CCTOSF' + '/IsRtokenexist?userName=' + userName;
		return this.FetchData(Weburl);
	}

	//Retreiving Tags based on the location of the selected tag	
	GetTagonEdit(tagName: string, CCtoken: string) {

		let Weburl =this.config.HttpURL + this.APIendpoint + '/GetTagonEdit?tag=' + tagName + '&accessToken=' + CCtoken;

		return this.FetchData(Weburl);
	}

	ConnecttoCC(userName: string, password: string) {

		var storeToken: any;
		var logError: any;

		//`username=${username}&password=${password}`;
		var body = '';
		body = 'grant_type=password&username=' + userName + '&password=' + password + ''
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		return this.http
			.post('https://manage.getcloudcherry.com/api/LoginToken', body, { headers: headers })
			.map(response => response.json());
	}



	GetAPIKey(AccessToken: string) {

		let Weburl = "https://api.getcloudcherry.com/api/GetAPIKey";
		return this.CCAPIGet(Weburl, AccessToken);
	}

	// Calls the API  given in parameters
	FetchData(Weburl: string) {

		let params = new URLSearchParams();
		params.set('search', '');
		params.set('action', '');
		params.set('format', 'json');
		params.set('callback', 'JSONP_CALLBACK');


		return this.jsonp
			.get(Weburl, { search: params })
			.map(request => <any>request.json());
	}
	PostIntegrationData(body: any, AccessToken: string) {
		let Weburl = "https://api.getcloudcherry.com/api/UserData/" + this.IntegrationKey;
		//	https://api.getcloudcherry.com/api/UserData/santhosh
		var integrationdata: any;
		return this.CCAPIPost(body, Weburl, AccessToken)


	}

	GetIntegrationData(AccessToken: string) {
		let Weburl = "https://api.getcloudcherry.com/api/UserData/" + this.IntegrationKey;

		return this.CCAPIGet(Weburl, AccessToken);
	}

	CCAPIPost(body: any, Weburl: string, AccessToken: string) {

		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append("Authorization", 'Bearer ' + AccessToken);
		return this.http.post(Weburl, JSON.stringify(body), { headers: headers })
			.map(response => response.json());

	}


	CCAPIGet(Weburl: string, AccessToken: string) {

		var storeToken: any;
		var logError: any;
		var headers = new Headers();
		headers.append('Accept', 'application/json');
		headers.append('Authorization', 'Bearer ' + AccessToken);

		return this.http
			.get(Weburl, { headers: headers })
			.map(request => <any>request.json())
	}



}


