import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import SimpleSchema from 'simpl-schema';
import hash from 'object-hash';

import jobQueue from '/imports/api/jobqueue/jobqueue.js';
import { Job } from 'meteor/local:job-collection';

import logger from '/imports/api/util/logger.js';

const downloadGenes = new ValidatedMethod({
  name: 'downloadGenes',
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
    },
    dataType: {
      type: String,
    },
    options: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  applyOptions: {
    noRetry: true,
  },
  run({ query, dataType, options }) {
    /**
     * If the query has not been used before, create a new file from it.
     * Otherwise use the cached file and increment the download count.
     * Return md5 hash of download query as download url
     */
    logger.log(`downloading ${dataType}`);
    logger.log(query);
    logger.log(options);

    const queryString = JSON.stringify(query);
    const optionString = JSON.stringify(options);

    const queryHash = hash(`${queryString}${dataType}${optionString}`);

    /*
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    */
    const existingJob = jobQueue.findOne({ 'data.queryHash': queryHash });

    if (typeof existingJob === 'undefined') {
      logger.debug('initiating new download job');
      const job = new Job(jobQueue, 'download', {
        queryString,
        queryHash,
        dataType,
        options,
      });
      job.priority('high').save();
    }

    return queryHash;
  },
});

export default downloadGenes;
