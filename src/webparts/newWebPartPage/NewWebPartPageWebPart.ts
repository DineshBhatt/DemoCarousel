import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import * as JQuery from 'jquery';
import { SPComponentLoader } from '@microsoft/sp-loader'
require('bootstrap');
import * as strings from 'NewWebPartPageWebPartStrings';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface INewWebPartPageWebPartProps {
  description: string;
}

export default class NewWebPartPageWebPart extends BaseClientSideWebPart<INewWebPartPageWebPartProps> {
  
  public render(): void {
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css");
    this.domElement.innerHTML = `
    <div class="container"style="width: inherit;">
    <h2>Current Affairs</h2>  
    <div id="myCarousel" class="carousel slide" data-ride="carousel">
     
        
      
  
     
        
      
  
      
    </div>
  </div>
  <div class="modal fade" id="myModal" role="dialog">
  </div>`;
  var Context = this.context.pageContext.web.absoluteUrl;
  this.getCarosalIndicatorItem();
  JQuery(document).ready(function(){

  });
  JQuery(document).on("click", ".btn-success" , function() {
    var a = $(this).attr("id");
    getLookUp(a);
  });
  function getLookUp(a)
  {
    
          var table = null;
          var call = jQuery.ajax({
            url: Context + "/_api/Web/Lists/getByTitle('Managers%20Speaks')/items?$select=Title,ImageUrl,ID,Subject,Description&$filter=(ID eq "+a+")",
            type: "GET",
            dataType: "json",
            headers: {
                Accept: "application/json; odata=verbose",
                "Content-Type": "application/json;odata=verbose"
            }
          });
          call.done(function (data, textStatus, jqXHR) {
            
            jQuery("#myModal div").remove();
            table = JQuery("#myModal");
            JQuery.each(data.d.results, function (idx, elem) {
                table.append(`<div class="modal-dialog">
                    
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">${elem.Subject}</h4>
                  </div>
                  <div class="modal-body">
                  <img src="${elem.ImageUrl}" alt="something" height="50%" width="50%">
                    <h3>Discription</h3>
                    <p>${elem.Description}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                  </div>
                </div>
                
              </div>`);
            });
        });
        call.fail(function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            var message = response ? response.error.message.value : textStatus;
            alert("Call hutch failed. Error: " + message);
        });
    }
    
  
  }
  getCarosalIndicatorItem(){
    let carosalIndicatorItemVariable:string = '<ol class="carousel-indicators">';
    let imageURl:string = '';
    if(Environment.type===EnvironmentType.Local){
      this.domElement.querySelector('.carousel-indicators').innerHTML = 'Not found';
    }else{
      this.context.spHttpClient.get(
        this.context.pageContext.web.absoluteUrl + `/_api/Web/Lists/getByTitle('Managers%20Speaks')/items?$select=Title,ImageUrl,ID,Subject,Description`, SPHttpClient.configurations.v1
      ).then((Response : SPHttpClientResponse)=>{
        Response.json().then((listObjects : any) =>{
          listObjects.value.forEach(element => {
            if(element.ID===1){
            carosalIndicatorItemVariable += `<li data-target="#myCarousel" data-slide-to=${element.ID-1} class='active'></li>`;
            imageURl +=`<div class='item active'><img src=${element.ImageUrl}" alt=${element.Subject} style='width:100%;height:500px;opacity: 0.8;'>
            <div style=" position: absolute;top: 10%;left: 50%;transform: translate(-50%, -50%);
              font-size: 24px;color: white;">${element.Subject}</div>
              <button type="button" id="${element.ID}" class="btn btn-success btn-lg" data-toggle="modal" data-target="#myModal" onclick="myFunction(20)" style=" position: absolute; bottom: 20px; right: 20%; font-size: 18px;">See more</button>
              </div>`;
            }else{
              carosalIndicatorItemVariable += `<li data-target="#myCarousel" data-slide-to=${element.ID-1} ></li>`;
              imageURl +=`<div class="item"><img src=${element.ImageUrl} opacity=0.2 alt=${element.Subject} style='width:100%; height:500px;opacity: 0.8;'>
              <div style=" position: absolute;top: 10%;left: 50%;transform: translate(-50%, -50%);
              font-size: 24px;color: white;">${element.Subject}</div>
              <button type="button" id="${element.ID}" class="btn btn-success btn-lg" data-toggle="modal" data-target="#myModal" style="position: absolute; bottom: 20px; right: 20%; font-size: 18px;">See More</button>
              </div>`
              ;
            }
            
          });
          this.domElement.querySelector('#myCarousel').innerHTML = carosalIndicatorItemVariable+ `</ol>  <div class="carousel-inner">`+imageURl+ `</div>
          <!-- Left and right controls -->
          <a class="left carousel-control" href="#myCarousel" data-slide="prev">
          <span class="glyphicon glyphicon-chevron-left"></span>
          <span class="sr-only">Previous</span>
          </a>
          <a class="right carousel-control" href="#myCarousel" data-slide="next">
          <span class="glyphicon glyphicon-chevron-right"></span>
          <span class="sr-only">Next</span>
          </a>`;
         
        });
      });
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
