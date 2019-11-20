const TwitterApi = require("../utilities/twitter_keys");
const AlgorithmiaApi = require("../utilities/algorithmia_keys");
const fs = require("fs");
const Keyword = require("../models/keyword");
const _ = require("lodash");
const geolocator = require("node-geocoder");
const { TWITTER_POST_LIMIT,config } = require("../config/constants");
const { formatDate } = require("../utils/dates");
const { getHashTagsAll } = require("../utils");
const Sentiment = require("sentiment");
const con = require("../config/db")

function JsonAdder(js1,js2){
let z = [js1,js2]
  let merged = z.reduce((r,o) => {
    Object.keys(o).forEach(k => {
      if(js1[k] && js2[k]){
      r[k] = parseInt(js1[k])+parseInt(js2[k])
      }
    })
    return r;
  },{});
return merged;


}
function dateFormatter(d){
  var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
d.getHours() + ":" + d.getMinutes();
return datestring;
}
var options = {
  provider: "opencage",

  // Optional depending on the providers
  httpAdapter: "https", // Default
  apiKey: "056b8034c6bf472b886785cdb7f86fec", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
var geocoder = geolocator(options);

function getGeoLocation(allLocations) {
  let locationPromises = null;
  if (!Array.isArray(allLocations)) {
    return new Promise((resolve, reject) => {
      geocoder
        .geocode(allLocations)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  } else {
    locationPromises = allLocations.map(function(loc) {
      return geocoder.geocode(loc);
    });

    // getting all the results now
    return new Promise((resolve, reject) => {
      Promise.all(locationPromises)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
}

function cloud_save(path, filename) {
  AlgorithmiaApi.file(path).exists(function(exists) {
    if (exists == true) {
      // Download contents of file as a string
      AlgorithmiaApi.file(path).get(async function(err, data) {
        if (err) {
          console.log("Failed to download file.");
          console.log(err);
        } else {
          await fs.writeFile("public/wordclouds/" + filename, data, function(
            err
          ) {
            // If an error occurred, show it and return
            if (err) return console.error(err);
            // Successfully wrote binary contents to the file!
            else {
              // console.log("downloaded");
            }
          });
        }
      });
    }
  });
}

module.exports.analyseTwitterData = async (req, res) => {
  let body = req.body;
  let hashtag = body.hashtag;
  req.session.hashtag = hashtag;
  //console.log(req.session.user.id)
  const unqCount = await Keyword.count({
    where:{
      userId: req.session.user.id
    },
     distinct: true,
  col: 'keyword'
 })
console.log(unqCount)
 if(unqCount < config.keywordLimit){
  try {
    let tweets = await TwitterApi.get("search/tweets", {
      q: hashtag,
      count: TWITTER_POST_LIMIT
    });
    

    tweets = tweets.data;
    let { statuses } = tweets;

    if(statuses.length == 0) return res.redirect("/search");
    // making post data with sentiment score
    let postsWithSentiment = [];
    let totalRetweets = 0,
      totalFilteredRetweets = 0,
      totalFavReweet = 0,
      totalFilteredFavReweet = 0,
      totalPositiveScore = 0,
      totalNegativeScore = 0,
      totalNeutralScore = 0,
      totalFilteredPositiveScore = 0,
      totalFilteredNegativeScore = 0;
    totalFilteredNeutralScore = 0;
    stringForWordCloud = "";
    let hashTagArray = [];
    
    postsWithSentiment = statuses.map(post => {
      // getting post url from extended entities
      let postUrl = null;
      try {
        postUrl = post.extended_entities.media[0].expanded_url;
      } catch (err) {
        // not required
      }
      

      let sentiment = new Sentiment();
      
      let thisSentiment = sentiment.analyze(post.text);
      // return res.json(thisSentiment);
      stringForWordCloud += post.text;
      // extracting hashtags for post text
      //console.log(post.text)
      let thisPostHash = getHashTagsAll(post.text);
      if (thisPostHash) hashTagArray.push(...thisPostHash);
      totalRetweets += post.retweet_count ? post.retweet_count : 0;
      //totalFav += post.favorite_count ? post.favorite_count : 0;
      totalFavReweet += (post.favorite_count + post.retweet_count);
      totalPositiveScore += thisSentiment.score > 0 ? 1 : 0;
      totalNegativeScore += thisSentiment.score < 0 ? 1 : 0;
      totalNeutralScore += thisSentiment.score == 0 ? 1 : 0;

      // -- calculating positive sentiment percentage
      
      
      return {
        url: "https://twitter.com/i/web/status/"+post.id_str,
        text: post.text,
        profile_link: "https://twitter.com/" + post.user.screen_name,
        source: post.source,
        score: thisSentiment.score,
        user_id: post.user.id,
        user_name: post.user.name,
        screen_name: post.user.screen_name,
        location: post.user.location,
        description: post.user.description,
        followers_count: post.user.followers_count,
        verified : post.user.verified,
        friends_count: post.user.friends_count,
        listed_count: post.user.listed_count,
        //favorite_count: post.favorite_count,
        statuses_count: post.user.statuses_count,
        user_lang: post.user.lang,
        profile_background_image_url: post.user.profile_background_image_url,
        profile_image_url: post.user.profile_image_url,
        retweet_count: post.retweet_count,
        retweeted: post.retweeted,
        exposure: post.retweeted
          ? post.retweeted_status.user.followers_count
          : null,
        //date: moment(post.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en'),
        date:dateFormatter(new Date(post.created_at)),
        dateUTC : post.created_at,
        device:post.source
      };
    });

    // if want to remove retweets
    postsWithSentimentFiltered = postsWithSentiment.filter(x => {
      if (!x.retweeted) {
        totalFilteredFavReweet += x.favorite_count + x.retweet_count;
        totalFilteredRetweets += x.retweet_count ? x.retweet_count : 0;
        totalFilteredPositiveScore += x.score > 0 ? 1 : 0;
        totalFilteredNegativeScore += x.score < 0 ? 1 : 0;
        totalFilteredNeutralScore += x.score == 0 ? 1 : 0;
      }
      return !x.retweeted;
    });

    let totalTweets =
      postsWithSentiment.length == 0 ? 1 : postsWithSentiment.length;
    let totalFilteredTweets =
      postsWithSentimentFiltered.length == 0
        ? 1
        : postsWithSentimentFiltered.length;

    // --dashboard data
    const dashboardData = {
      total_tweets: totalTweets,
      total_flitered_tweets: totalFilteredTweets,
      total_retweets: totalRetweets,
      total_filtered_retweets: totalFilteredRetweets,
      engagement: totalFavReweet,
      engagement_filtered: totalFilteredFavReweet,
      total_positive_score: totalPositiveScore,
      total_negative_score: totalNegativeScore,
      total_neutral_score: totalNeutralScore,
      total_filtered_positive_score: totalFilteredPositiveScore,
      total_filtered_negative_score: totalFilteredNegativeScore,
      total_filtered_neutral_score: totalFilteredNeutralScore,
      positive_score_percent: (
        (totalPositiveScore / totalTweets) *
        100
      ).toFixed(2),
      positive_filtered_score_percent: (
        (totalFilteredPositiveScore / totalFilteredTweets) *
        100
      ).toFixed(2),
      negative_score_percentage: (
        (totalNegativeScore / totalTweets) *
        100
      ).toFixed(2),
      negative_filtered_score_percent: (
        (totalFilteredNegativeScore / totalFilteredTweets) *
        100
      ).toFixed(2),
      neutral_score_percentage: (
        (totalNeutralScore / totalTweets) *
        100
      ).toFixed(2),
      neutral_filtered_score_percentage: (
        (totalFilteredNeutralScore / totalFilteredTweets) *
        100
      ).toFixed(2)
    };
    
    // --dateJson data
    // let dateJsonDataPromise = AlgorithmiaApi.algo("Vidyush/Forth/0.1.2").pipe(
    //   JSON.stringify(statuses)
    // );
    // dateJsonData = dateJsonData.result;

    // -- word cloud path
    let wordCloudPathPromise = AlgorithmiaApi.algo(
      "Vidyush/wordcloud/0.2.7"
    ).pipe(stringForWordCloud);

    let analyticsDataResponse = await Promise.all([
      // dateJsonDataPromise,
      wordCloudPathPromise,
    ]);
    let [wordCloudPath, hashTagCloudPath] = analyticsDataResponse;
   // dateJson = dateJson.result;
    wordCloudPath = wordCloudPath.result;
    let lastIndex = wordCloudPath.lastIndexOf("/");
    let wordCloudFileName = wordCloudPath.substring(lastIndex);
    cloud_save(wordCloudPath, wordCloudFileName);

    const keyss = await Keyword.findOne({
      where:{
        keyword: hashtag,
        userId: req.session.user.id
      }
    })
    
    let keyWordEntry;
   
 if(keyss){
  let nstatuses = statuses.concat(keyss.fullStream)
  let npostsWithSentiment = postsWithSentiment.concat(keyss.postsWithSentiment)  
  let ndashboardJson = JsonAdder(dashboardData,keyss.dashboardJson)
  let nhashTagArray = hashTagArray.concat(keyss.hashTagArray)
  keyss.wpath = "/public/wordclouds/" + wordCloudFileName
  keyss.fullStream = nstatuses
  keyss.postsWithSentiment = npostsWithSentiment
  keyss.dashboardJson = ndashboardJson
  keyss.hashTagArray = nhashTagArray
  
  keyss.save().then(()=>{
    console.log("updated")
  }).catch(err=>{
    console.log(err);
  })
  
  req.session.keyword = { id: keyss.id, name: keyss.keyword };
    return res.redirect("/posts");
}

else{
     keyWordEntry = await Keyword.create({
      keyword: hashtag,
      userId: req.session.user.id,
      wpath: "/public/wordclouds/" + wordCloudFileName,
      fullStream: statuses,
      postsWithSentiment: postsWithSentiment,
      dashboardJson: dashboardData,
      hashtagArray:hashTagArray,
    });
    req.session.keyword = { id: keyWordEntry.id, name: keyWordEntry.keyword };
    return res.redirect("/posts");
  }

    
  } catch (err) {
    res.send(err);
  }
}
else{
  return res.redirect("/recents")
}
};
