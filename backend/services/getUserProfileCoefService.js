const request = require('request-promise'),
  Promise = require('bluebird'),
  config = require('../config'),
  PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3'),
  _ = require('lodash');

module.exports = async (req, res) => {

  if (!req.query.profile_url)
    return Promise.reject({});

  let text = await request(req.query.profile_url);

  let matterTopics = [
    {topic: 'consumption_preferences_automobile_ownership_cost', weight: 0.2}, //don't prefer credits 0.2
    {topic: 'consumption_preferences_automobile_safety', weight: 0.4}, //safety add confidence 0.4
    {topic: 'consumption_preferences_eat_out', weight: 0.1}, //bad habits 0.1
    {topic: 'consumption_preferences_gym_membership', weight: 0.3} // good habit (look after health) 0.3
  ];

  let personality_insights = Promise.promisifyAll(
    new PersonalityInsightsV3({
      username: '053fee15-7886-4f5e-996f-9a9a8034984a',
      password: 'I3GAKULLDStq',
      version_date: '2016-10-19'
    })
  );


  let response = await personality_insights.profileAsync({
    text: text,
    consumption_preferences: true
  });

  let coefs = _.chain(response)
    .get('consumption_preferences', [])
    .filter(pref =>
      [
        'consumption_preferences_health_and_activity',
        'consumption_preferences_shopping'
      ].includes(pref.consumption_preference_category_id))
    .map(pref => pref.consumption_preferences)
    .flattenDeep()
    .filter(topic =>
      _.find(matterTopics, {topic: topic.consumption_preference_id})
    )
    .map(topic =>
      ({
        score: topic.score,
        type: topic.consumption_preference_id,
        weight: _.chain(matterTopics)
          .find({topic: topic.consumption_preference_id})
          .get('weight', 0)
          .value()
      })
    )
    .value();

  res.send({
    coefs: coefs,
    timestamp: Date.now()
  });

};