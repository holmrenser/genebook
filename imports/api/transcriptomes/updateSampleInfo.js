import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import SimpleSchema from 'simpl-schema';

import { ExperimentInfo } from '/imports/api/transcriptomes/transcriptome_collection.js';

/**
 * updateSampleInfo validated method: Update transcriptome information and groups
 * @param  {String} options.trackName Name of the annotation track
 * @param  {String} options.dbType    Either nucl or prot
 * @return {String}                   jobId of the makeblastdb job
 */
export const updateSampleInfo = new ValidatedMethod({
  name: 'updateSampleInfo',
  validate: new SimpleSchema({
    _id: { type: String },
    sampleName: { type: String },
    experimentGroup: { type: String },
    replicaGroup: { type: String },
    description: { type: String },
    permissions: { type: Array },
    'permissions.$': { type: String }
  }).validator(),
  applyOptions: {
    noRetry: true
  },
  run({ _id, sampleName, experimentGroup, replicaGroup, description, permissions }){
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (! Roles.userIsInRole(this.userId,'admin')){
      throw new Meteor.Error('not-authorized');
    }

    if (permissions.length === 0){
      permissions.push('admin')
    }

    console.log({
      _id,sampleName,experimentGroup,replicaGroup,description,permissions
    })

    ExperimentInfo.update({
      _id: _id
    },{
      $set: {
        sampleName,
        experimentGroup,
        replicaGroup,
        description,
        permissions
      }
    })
  }
})