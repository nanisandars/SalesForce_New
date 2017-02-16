import { Component, OnInit, ChangeDetectionStrategy, ViewChild, EventEmitter, Output} from 'angular2/core';
import { Router,RouteParams} from 'angular2/router';

import { CCSFService } from '../service/CCSFService.service';
import {Observable} from 'rxjs/Rx';
import { ChangeDetectorRef} from 'angular2/core';
import {HTTP_PROVIDERS, Http, Response, Headers, Jsonp, JSONP_PROVIDERS, ConnectionBackend} from 'angular2/http';

@Component(
{
    selector: 'SFSettings',
    templateUrl: './partials/pages/SF.component.html',
    providers: [
        CCSFService, JSONP_PROVIDERS
    ],
 inputs: ['userName', 'CCMappings', 'APIKey', 'Questionslist'],
		outputs: ['PostIntegration']
   
})
export class SFComponent implements OnInit {
	public PostIntegration = new EventEmitter();
    public userName: string;
	public CCMappings: any;
    salesforcekey="integrations.salesforce"
    Loginjson: any  ;
    Questionslist: any;
    items:  any  ;
    Loader: boolean = true;
    showloading = true;
    Qmap: any
    searchMap: string = "";
    title = 'Settings(Salesforce)';
    Field: string = "";
    Qid: string = "";
    UField: string = "";
    UQid: string = "";
    public Clientid: string = '';
    public Secret: string = '';
    MapPagesize: Number = 5;
    pageindex: Number = 1;
    Htmldata: any ;
    RToken:  any  ;
    RefreshTokenDetails: any  ;
    Loadedalready: boolean = false;
    ErrorMessage: string = "";
    Message: string = '';
    Credentials: boolean = true;
    CredentialsCC: boolean = true;
    Questions: any = undefined
    Qmapbackup: any = null;;
    tokendetails: any;
    errordetails: any;
    InsertEditFlag: Boolean = false;
    InsertEditid: string = "";
    InsertError: string = '';
    Tagdata: string = "";
    ActionPerformed: Boolean = false;
    isMappingLoaded = false;
    Edittag: string = "";
    maporder: boolean = true;
    cdr: any;
    UserName: string = "";
    Password: string = "";
    APIKey: string = "";
    SFintegrationdata: any;
    SFintegrationdata_copy: any;
    SFPostintegrationdata: any;
    Editmap: any = [];
    EnableDisablemap: any = [];
    ToEnable: boolean = true;
    PopupMessage: string = "";
    PopupAction: string = "";
    modalTitle:string="";
    public rtoken: string = '';
    public ccsfparams: any ;
    public SessionUserName: string = '';
    public SessionPassword: string = '';
    public CCAccesToken: string = '';
    samplemodal:boolean=false;
    constructor(
        private ccsf: CCSFService,
        private route: Router, cdr: ChangeDetectorRef, private params: RouteParams)
   {
        this.cdr = cdr;
    }
    ngOnInit() {
        this.SessionUserName = this.userName
        this.RefreshTokenDetails = this.ccsf.IsRtokenexist(this.SessionUserName);
        this.CredentialsCC = false;
        this.SFintegrationdata_copy = this.CCMappings;

        if (this.SFintegrationdata_copy != null&& this.SFintegrationdata_copy.length!=0) {
         
            this.SFintegrationdata = JSON.parse(this.SFintegrationdata_copy);
            this.Qmap = this.SFintegrationdata.Mappings;
        }

    }
    //Navigation to exception page
    Navigatetoexceptions()
        {
            this.route.navigateByUrl(`/SFExceptions/${this.SessionUserName}/${this.CCAccesToken}`);
        }
    //Loading the necessary data if Refresh token exist else  enables login credentials to login
    Initialise(Tokenobj: any)
        {
            this.rtoken = Tokenobj.refreshtoken;
            //skips executing the function if called for the second time
            if (this.Loadedalready == true)
                return
            this.Loadedalready = true;
            if (Tokenobj.refreshtoken != "" && Tokenobj.refreshtoken != null && Tokenobj.refreshtoken != undefined)
            {
                this.Credentials = false;
                //Retreiving all Tags and fields based on the given Refresh token
                this.Loginjson = null
                this.ccsf.ConnectNRetrieveQidsNfields(this.rtoken).subscribe(item => this.Loginjson = item);
                this.Waituntilloginjsonload();

            }
            else
            {
                this.Message = '';
                this.InsertError = Tokenobj.error;
                this.Credentials = true;

                this.showloading = false;
            }
            this.cdr.detectChanges();
        }
        //waiting  until Loginjson object loads
    Waituntilloginjsonload()
    {
        var that = this;
        setTimeout(function()
        {
            if (that.Loginjson == null)
            //Recursively called until Loginjson data  is null
                that.Waituntilloginjsonload();
            else
            {
                that.showloading = false;
                //if any tags are removed in CC Then that  tags are removed from mapping list that are  displayed in UI
                var Tempqmap = [];
	 	if(that.Qmap!=null){
              

                for (var Qmapcounter = 0; Qmapcounter < that.Qmap.length; Qmapcounter++)
                {
                    var qobj = that.Questionslist.filter(item => item.id == that.Qmap[Qmapcounter].qid)
                    if (qobj.length == 0) {
                      //Verifying if question is retired, retired question is skipped from displaying                   
                       
                       continue;
                    }
                    //If no question tags exist, empty space are added to tag property
                     if (qobj[0].questionTags == null) {
                    that.Qmap[Qmapcounter].tag = "";
                        continue;
                    }else if (qobj[0].questionTags.length == 0) {
                        that.Qmap[Qmapcounter].tag = "";
                    }
                    else
                    {//Assigning the first tag to Tag  property, [assuming the  maximum  number of tags are one]
                     // so even if the  tags are renamed the latest name will be visible in UI.
                        that.Qmap[Qmapcounter].tag=qobj[0].questionTags[0];
                    }
                    Tempqmap.push(that.Qmap[Qmapcounter]);
                }
}
                that.Qmap=Tempqmap;
               that.Qmapbackup=that.Qmap;
              
              
            }
        }, 500);
    }
    //Connect to SF account
    Connect()
        {
            this.Htmldata = null;
            this.InsertError = "";
            this.Message = '';
            this.cdr.detectChanges();
            if (this.Clientid == "" && this.Secret == "")
            {
                this.InsertError = "Please enter Client id and Secret key"
            }
            else if (this.Clientid == "")
            {
                this.InsertError = "Client id is empty"
            }
            else if (this.Secret == "")
            {
                this.InsertError = "Secret Key  is empty"
            }
            else
            {
                this.Htmldata = null;
                //Connecting to Sf account
                this.ccsf.connect2SFAccount(this.Clientid, this.Secret, this.SessionUserName, this.APIKey).subscribe(items => this.Htmldata = items);
                var that = this;
                this.LoadSfurl();
            }
            this.cdr.detectChanges();
        }
        // waits until SFURL is retreived.
    LoadSfurl()
        {
            var that = this;
            setTimeout(function()
            {
                if (that.Htmldata == null)
                //calling itselves repeatedly until SF URL is loaded
                    that.LoadSfurl();
                else
                    that.navigate(that.Htmldata);
            }, 2000);
        }
        //Navigation to  salesforce url
    navigate(item: any)
    {
        if (this.Message != "")
            return;
        if (item[0].sFurl.length < 100)
        {
            this.InsertError = "Please enter valid client id or secret key"
            return;
        }
        if (item[0].error == "")
        {
            if (item[0].sFurl.length > 100)
                window.location.href = item[0].sFurl;
        }
        else
        {
            if (this.Message == "")
            {
                this.Message = item[0].error;
                return;
            }
        }
        this.cdr.detectChanges();
    }
    //Fired from UI when Update button is called
    UpdateTagFieldMapping()
    {
        this.prepareIntegrationData(this.Qmapbackup);
    }
    prepareIntegrationData(Mappings: any)
    {        
        //Verifying if  mappings already exist or not.
        if (Mappings.length == 0)
        {
            this.Message = "";
            this.InsertError = "No mappings exist";
            return;
        }
        var logindata = null;
        var Preparedata = {
            "Login": logindata,
            "Mappings": Mappings,
            "MappingsBackup": Mappings
        };
        if (this.SFintegrationdata == null)
        {
            this.SFintegrationdata = Preparedata;
        }
        else
        {
            for (var counterbkp = 0; counterbkp < this.Qmapbackup.length; counterbkp++)
            {
                this.Qmapbackup[counterbkp].time = new Date();
                if (this.SFintegrationdata.MappingsBackup == null)
                    this.SFintegrationdata.MappingsBackup = [];
                this.SFintegrationdata.MappingsBackup.push(this.Qmapbackup[counterbkp]);
            }
        }
        this.SFintegrationdata.Mappings = Mappings;
        var mappingstring = JSON.stringify(this.SFintegrationdata);
        var Updateddata = {
            value: mappingstring
        };
     
        //Updating the mapping details into CC
        var errordetails:any;
        this.ccsf.PostIntegrationData(Updateddata, this.CCAccesToken).subscribe(items => this.SFPostintegrationdata = items, err=>errordetails=err)
       
        this.InsertError = "";
var that=this;
 that.InsertError="";
  that.Message="";
        setTimeout(function() {
         
          if(errordetails._body!=null)
              that.InsertError= JSON.parse(errordetails._body).message;
              else
              that.Message="Saved Sucessfully"
        }, 3000);
    }


    Logthemaping()
    {
          var Preparedata = {
            "Login": null,
            "Mappings": this.Qmapbackup,
            "MappingsBackup": []
        };
        if (this.SFintegrationdata == null)
        {
            this.SFintegrationdata = Preparedata;
        }
       
      
        var length= this.Qmapbackup.length;
            for (var counterbkp = 0; counterbkp < length; counterbkp++)
            {
                this.Qmapbackup[counterbkp].time = new Date();
                if (this.SFintegrationdata.MappingsBackup == null)
                    this.SFintegrationdata.MappingsBackup = [];
                this.SFintegrationdata.MappingsBackup.push(this.Qmapbackup[counterbkp]);
            }
       
        this.SFintegrationdata.Mappings = this.Qmapbackup;
     	this.PostIntegration.emit({ mapping: this.SFintegrationdata, value: this.salesforcekey });
    }
    //Initialising the  code content are displayed on  the page after loading
    Initilalise(item)
    {
        var CCtoken = item.ccToken
        if (this.isMappingLoaded == true)
            return;
        this.ccsfparams = this.Loginjson;
        this.isMappingLoaded = true;
        this.CCAccesToken = CCtoken;
        this.BackupMapping();
        this.Stoploader();
    }
    //Insert for   CC to SF Tag- field mapping 
    AddMapping(Tagdata: any, Field: string, CCtoken: string)
        {

            this.InsertError = "";
            this.Message = "";
            var res = Tagdata.split(":");
            var Tagid = res[0];
            var qid = res[1];
            //vallidating mapping
            if (Tagid == "" && Field == "")
                this.InsertError = "Please select question tag and field";
            else if (Tagid == "")
                this.InsertError = "Please select question tag";
            else if (Field == "")
                this.InsertError = "Please select salesforce field";
            else if (!this.IsTagFieldMapped(qid, Field, this.InsertEditid))
            {
                return;
            }
            else
            {
                if (this.InsertEditFlag)
                {
                    //Editing od the existing maps
                    this.EditTagFieldMapping(this.InsertEditid, Tagid, Field, 'False',qid)
                    this.ActionPerformed = true;
                    this.CancelEdit()
                }
                else
                {
                    //Inserting new map
                    this.ActionPerformed = true;
                    var today = new Date();
                    today.getDate();
                    var _id = "tag_" + Math.floor((Math.random() * 1000000000) + 1) + "" + today.getMonth() + "" + today.getDate() + "" + today.getHours() + "" + today.getMilliseconds();
                    var timenow = new Date;

                    var singlemap = {
                        "_id": _id,
                        "tag": Tagid,
                        "qid": qid,
                        "field": Field,
                        "disabled": "False",
                        "error": "",
                        "time": timenow
                    }
                    //single map is added to existing mapping
                    this.Qmapbackup.push(singlemap);
                    this.SearchMap()
                    this.Logthemaping();
                }
                this.InsertEditFlag = false;
                this.InsertEditid = "";
                this.Qid = "";
                this.Field = "";
                this.Tagdata = "";
            }
        }
        /**Editing the selected map to given details */
    EditTagFieldMapping(_id: string, Tagid: string, Field: string, isDisabled: string, Qid: string)
        {
            for (var counter = 0; counter < this.Qmap.length; counter++)
            {
                if (this.Qmap[counter]._id == _id)
                {
                    for (var counterbkp = 0; counterbkp < this.Qmapbackup.length; counterbkp++)
                    {
                        if (this.Qmap[counter]._id == this.Qmapbackup[counterbkp]._id)
                        {
                            if (Tagid != '')
                            {
                                this.Qmap[counter].tag = Tagid;
                                this.Qmapbackup[counterbkp].tag = Tagid;
                            }
                            if (Field != '')
                            {
                                this.Qmapbackup[counterbkp].field = Field;
                                this.Qmap[counter].field = Field;
                            }
                            if (isDisabled != '')
                            {
                                this.Qmapbackup[counterbkp].disabled = isDisabled;
                                this.Qmap[counter].disabled = isDisabled;
                            }
                            if (Qid != '')
                            {
                                this.Qmapbackup[counterbkp].qid = Qid;
                                this.Qmap[counter].qid = Qid;
                            }
                        }
                    }
                }
            }
            this. Logthemaping();
        }
        // Messages to show in popup  based on te actio given
    ShowinPopup(map: any, Action: string)
        {
	    this.samplemodal = true;
            this.Message = "";
            this.PopupAction = Action;
	    this. modalTitle=Action+" Dialog"
            switch (Action)
            {
                case "Edit":
                    this.Editmap = map;
                    this.PopupMessage = "Are you sure you want to edit?";
                    break;
                case "Enable":
                    this.EnableDisablemap = map;
                    this.PopupMessage = "Are you sure you want to enable?";
                    break;
                case "Disable":
                    this.EnableDisablemap = map;
                    this.PopupMessage = "Are you sure you want to disable?";
            }
        }
        //based on the given action  from popup respective methods are called 
    ConfirmAction()
        {
            switch (this.PopupAction)
            {
                case "Edit":
                    this.EditInsertMap();
                    break;
                case "Enable":
                    this.EnableInsertMapping();
                    break;
                case "Disable":
                    this.DisableInsertMapping(this.EnableDisablemap._id);
            }
        }
        //Editing mapping, on selecting a paticular tag, then locations related to particular tag is retreived and 
        // then tags related to retreived locations are displayed in popup, where fields are displayed as it is
    EditInsertMap()
    {
        var map = this.Editmap;
        this.InsertError = "";
        this.Message = '';
        this.Edittag = map._id;
        this.InsertEditFlag = true;
        this.Questions = null;
        //Retreving tags based on the location of the selected tag
        this.GetTagOnEdit(map.qid);
        this.Qid = map.qid + '$$$' + map.tag; // Question id and tag are appended as question ids are stored in mappings in CC 
        //storing the id of the mapping selected for edit
        this.InsertEditid = map._id;
        this.Field = map.field;
        this.Tagdata = "";
    }
    	//To fetch the respective edited tag data
    GetTagOnEdit(Questionid: string) {
        var questionobject = this.Questionslist.filter(item => item.id == Questionid);
      
        if(questionobject==null || questionobject.length==0)
        return;

		var Tagslist = questionobject[0].questionTags;
		var locationslist = questionobject[0].displayLocation;    
      
		if (locationslist.length == 0) {
            return	
        }
      
		var LocationQuestions = this.Questionslist.filter(item => (item.displayLocation.some(r => locationslist.includes(r))));
		LocationQuestions.forEach((singlequestion: any) => { Tagslist = Tagslist.concat(singlequestion.questionTags) });
		LocationQuestions = this.Questionslist.filter(item => (item.displayLocation.length===0));
		LocationQuestions.forEach((singlequestion: any) => { Tagslist = Tagslist.concat(singlequestion.questionTags) });


        var finaltagslist = [];
		Tagslist.forEach((singleTag: any) => {

			if (finaltagslist.indexOf(singleTag) < 0 && singleTag.toLowerCase() != "nps") {
				finaltagslist.push(singleTag);
            }
		});


        
	var that=this;
	that.Questions=[];
	var Qlist = [];
        var sorttags = [];
        this.Questionslist.filter(function(item){
            if(item.questionTags != null && item.questionTags.length > 0)
            {
                    if(finaltagslist.indexOf(item.questionTags[0]) >= 0)
                    {
                      
                         var obj = { "tag": item.questionTags[0], "qid": item.id  };
                    
			 sorttags.push(item.questionTags[0]);
                    	 Qlist.push(obj);
                    }
            }
            
        });
       



        sorttags.sort(function (a, b) {
            return (a > b) ? -1 : (a < b) ? 1 : 0;
        });

        sorttags.reverse();

        for (var single of sorttags) {
            var obj = Qlist.filter(item => item.tag == single);
            if (obj[0] != null)
                this.Questions.push(obj[0])
        }



    }
    //Disable  or enable  CC to SF Tag- field mapping
    DisableInsertMapping(id: string)
        {
            this.InsertError = "";
            this.Message = '';
            this.EditTagFieldMapping(id, '', '', 'True','')
            this.CancelEdit();
            //	}
        }
        //Creating a backup for mapping
    BackupMapping()
    {
        var that = this;
        setTimeout(function()
        {
            that.Qmapbackup = that.Qmap;
        }, 3000);
    }
    //Enable  or disable  CC to SF Tag- field mapping
    EnableInsertMapping()
        {
            var id = this.EnableDisablemap._id;
            var QuestionTag = this.EnableDisablemap.tag;
            var SFField = this.EnableDisablemap.field;
            this.InsertError = "";
            this.Message = '';
            //vallidating the  mapping to enable
            if (!this.IsThisMappingExist(this.EnableDisablemap.qid, SFField))
            {
                this.InsertError = "Question tag/Salesforce field already used, cannot be enabled";
                return;
            }
            //Enabling the mapping
            this.EditTagFieldMapping(id, '', '', 'False','')
            this.CancelEdit();
        }
        //validdating the mapping  that given tag and  field already exist or not.
    IsTagFieldMapped(questionid: string, field: String, mapId: string)
        {
            var QuestionTagcount = 0;
            var SFFieldCount = 0;
            this.InsertError = "";
            for (var count = 0; count < this.Qmapbackup.length; count++)
            {
                if ((this.Qmapbackup[count].qid == questionid) && (this.Qmapbackup[count]._id != mapId) && (this.Qmapbackup[count].disabled != 'True'))
                {
                    this.InsertError = "Question tag already used";
                    return false;
                }
                if ((this.Qmapbackup[count].field == field) && (this.Qmapbackup[count]._id != mapId) && (this.Qmapbackup[count].disabled != 'True'))
                {
                    this.InsertError = "Salesforce field already used";
                    return false;
                }
            }
            return true;
        }
        //vallidating the  mapping to enable or disable
    IsThisMappingExist(Questionid: string, field: String)
    {
        this.InsertError = "";
        var QuestionTagcount = 0;
        var SFFieldCount = 0;
        for (var count = 0; count < this.Qmapbackup.length; count++)
        {
            //Verifying if the questiontag already exist, and skipped from counting the tag if the tag is empty or disabled 
            if (this.Qmapbackup[count].qid == Questionid  && (this.Qmapbackup[count].disabled.toUpperCase() != 'TRUE'))
            {
                QuestionTagcount++;
            }
            //Verifying if the field  already exist, and skipped from counting the tag if the tag is disabled 
            if (this.Qmapbackup[count].field == field && (this.Qmapbackup[count].disabled.toUpperCase()!= 'TRUE'))
            {
                SFFieldCount++;
            }
        }
        if (QuestionTagcount >= 1 || SFFieldCount >= 1)
        {
            //this.InsertError = "Question tag already used, cannot be enabled";
            return false;
        }
        return true;
    }
    //Displays error message
    PrintInserterror(map, ActionPerformed)
    {
        if ((ActionPerformed) && (map.error != ""))
        {
            this.ActionPerformed = false;
            this.InsertError = map.error;
        }
        if (map.error == "")
        {
            this.InsertError = "";
        }
    }
    //displays loading image
    StartLoader()
        {
            this.Loader = true;
            this.InsertError = "";
            this.Message = '';
        }
        //stopping loading image
    Stoploader()
        {
            this.Loader = false;
        }
        //Cancel Edit
    CancelEdit()
        {
            this.Questions = null;
            this.Edittag = "";
            this.InsertError = "";
            this.InsertEditFlag = false;
            this.Field = "";
            this.Tagdata = "";
            this.Message = "";
        }
        //search on mapings
    SearchMap()
        {
            this.InsertError = '';
            this.Message = '';
            this.Qmap = this.Qmapbackup.filter((item) => item.tag.toUpperCase().indexOf(this.searchMap.toUpperCase()) > -1 || item.field.toUpperCase().indexOf(this.searchMap.toUpperCase()) > -1);
        }
        //sortings on mappings
    SortMap(column: string)
    {
        this.InsertError = '';
        this.Message = '';
        this.maporder = !this.maporder;
        this.Qmap.sort((a, b) =>
        {
            var textA = '';
            var textB = '';
            if (column == 'Tag')
            {
                textA = a.tag.toUpperCase();
                textB = b.tag.toUpperCase();
            }
            else
            {
                textA = a.field.toUpperCase();
                textB = b.field.toUpperCase();
            }
            if (this.maporder)
                return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
            else
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }
    	ngModalClose() {
		this.samplemodal = false;
		this.PopupMessage = "";
	}
}
