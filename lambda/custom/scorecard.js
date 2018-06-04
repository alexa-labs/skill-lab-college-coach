/**
 * This class is used to make Rest calls to the college scorecard api
 * in order to get the school information.
 * @author : ankjain
 * INTERNAL: Methods tagged as INTERNAL should not be used from lambda handlers.
   EXPOSED	: Methods tagged as EXPOSED can be used from the lambda handlers
 * 
 */
'use strict';
const promise = require('request-promise');

function Scorecard() {
	//setting the apiKey
	this.api_key = process.env.API_KEY;
	
	//setting the feilds we need back from the api
	this.fields  = 'id,school.name,school.city,school.state,2015.student.size,' 
	+ 'school.branches,school.ownership,school.degrees_awarded.predominant,' 
	+ '2015.cost.avg_net_price.overall,2015.completion.rate_suppressed.overall,' 
	+ 'school.under_investigation';

	//uri
	this.uri = 'https://api.data.gov/ed/collegescorecard/v1/schools';
}
	

//Returns the complete list of schools along with metadata
/* @EXPOSED */
Scorecard.prototype.getSchoolInformation = function(parameterMap) {
	
	parameterMap['api_key'] = this.api_key;
	parameterMap['fields']  = this.fields;
	this.options = {
		uri: this.uri,
		qs: parameterMap,
		json: true
	};

  	return promise(this.options)
			.then(function(response) {
				return response;
			})
			.catch(function(err) {
				return err;
			});
}

//Returns the complete list of school names.
/* @EXPOSED */
Scorecard.prototype.listAllSchools = function(parameterMap) {
	parameterMap['api_key'] = this.api_key;
	parameterMap['fields']  = this.fields;
	this.options = {
		uri: this.uri,
		qs: parameterMap,
		json: true
	};
	return promise(this.options)
			.then(function(response) {
				var schoolMetadataList = response.results;
				if(schoolMetadataList != 'undefined' && schoolMetadataList) {
					var schoolNameList = [];
					for(var i = 0; i < schoolMetadataList.length; i++ ) {
						schoolNameList.push(schoolMetadataList[i]['school.name']);
					}
					return schoolNameList;
				} else {
					return 'NO_SCHOOLS_FOUND';
				}			
			})
			.catch(function(err) {
				return err;
			});
}

//Returns the metadata of given school name.
/* @EXPOSED */
Scorecard.prototype.getSchoolMetadata = function(schoolName) {
	var parameterMap = {};
	parameterMap['api_key'] = this.api_key;
	parameterMap['fields']  = this.fields;
	parameterMap['school.name'] = schoolName;
	this.options = {
		uri: this.uri,
		qs: parameterMap,
		json: true
	};

	return promise(this.options)
			.then(function(response) {
				var schoolMetadata = response.results;
				if(schoolMetadata != 'undefined' && schoolMetadata) {
					//first result is the closest match.
					return schoolMetadata[0];
				} else {
					return 'NO_METADATA_FOR_SCHOOLS_FOUND_IN_2015';
				}			
			})
			.catch(function(err) {
				return err;
			});
}
module.exports = Scorecard;
