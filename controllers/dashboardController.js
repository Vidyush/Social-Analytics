// Dashboard Controller
const Keyword = require("../models/keyword");
const _ = require("lodash");
const Transaction = require("../models/transaction");
const { getKeywordData } = require("../utils/ModelUtils");
const con = require("../config/constants");
const sequelize = require("sequelize");

function instaValues(arr1){
  var checkdate = [];
  var fnldata = [];
  for(var i=0;i<arr1.length;i++){
      var datem = new Date(arr1[i].date);
      console.log(datem)
      var d = datem.getDate();
      var m = datem.getMonth() + 1;
      var y = datem.getFullYear();
  
      var fnldate = y+'-'+m+'-'+d;
      if(checkdate.includes(fnldate)){
        var index = checkdate.indexOf(fnldate);
        fnldata[index].totalTweets++;
        fnldata[index].retweet_count += arr1[i].likes_count;
        fnldata[index].favorite_count += arr1[i].comments_count;
    }else{
        checkdate[i] = fnldate;
        fnldata[i] = {"date":fnldate,"totalTweets":1,"retweet_count":arr1[i].likes_count,"favorite_count":arr1[i].comments_count};
    }
      // if(checkdate.includes(fnldate)){
      //     var index = checkdate.indexOf(fnldate);
      //     fnldata[index].totalTweets++;
      //     fnldata[index].retweet_count += arr1[i].retweet_count;
      //     fnldata[index].favorite_count += arr1[i].favorite_count;
      // }else{
      //     checkdate[i] = fnldate;
      //     fnldata[i] = {"date":fnldate,"totalTweets":1,"retweet_count":arr1[i].retweet_count,"favorite_count":arr1[i].favorite_count};
      // }
  }
  fnldata = fnldata.filter(function(){return true;});
  return(fnldata);
}

function twitterValues(arr1){
  var checkdate = [];
  var fnldata = [];
  for(var i=0;i<arr1.length;i++){
      var datem = new Date(arr1[i].dateUTC);
      // console.log(datem)
      var d = datem.getDate();
      var m = datem.getMonth() + 1;
      var y = datem.getFullYear();
  
      var fnldate = y+'-'+m+'-'+d;
      
      if(checkdate.includes(fnldate)){
          var index = checkdate.indexOf(fnldate);
          fnldata[index].totalTweets++;
          fnldata[index].retweet_count += arr1[i].retweet_count;
          fnldata[index].favorite_count += arr1[i].favorite_count;
      }else{
          checkdate[i] = fnldate;
          fnldata[i] = {"date":fnldate,"totalTweets":1,"retweet_count":arr1[i].retweet_count,"favorite_count":arr1[i].favorite_count};
      }
  }
  fnldata = fnldata.filter(function(){return true;});
  return(fnldata);
}

// function counter(a){
//   let uniqLocations = a.  reduce((acc, val) => {
//       acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
//       return acc;
//     }, {});
//     let location_array = [["location", "value"]];
//     for (var i in uniqLocations) {
//       location_array.push([i, uniqLocations[i]]);
//     }
//   return location_array
//   }

function counter(a){
  let uniqLocations = a.  reduce((acc, val) => {
      acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
      return acc;
    }, {});
    let location_array = [];
    for (var i in uniqLocations) {
      location_array.push({text: i,size:uniqLocations[i]});
    }
  return location_array
  }
function count_source(source, d) {
  let st = [];
  source.forEach(s => {
    st.push(s.source);
  });
  let new_arr = [];
  st.forEach(function(tag) {
    //console.log(tag);
    new_arr.push(tag.match(/<a.*>(Twitter )?(for )?(.*)<\/a>/)[3]);
  });

  var uniqs = new_arr.reduce((acc, val) => {
    acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
    return acc;
  }, {});

  let score_array = [[d, "value"]];
  for (var i in uniqs) {
    score_array.push([i, uniqs[i]]);
  }
  //console.log(data)
  return score_array;
}

function parseAndFormat(ss) {
  var s = new Date(ss).toUTCString;

  // Helper
  function z(n){return (n<10? "0":'') + n;}

  // Split into parts
  //var b = s.split(/[ :]/);
  var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Create a date based on UTC values
 // var d = new Date(Date.UTC(b[3], m.indexOf(b[1]), b[2], b[4], b[5], b[6]));
var d = new Date(s)
  // Add 5 hours 30 minutes to the UTC time -> IST
  d.setUTCHours(d.getUTCHours() + 5, d.getUTCMinutes() + 30);

  // Format the hours for am/pm
  var hr = d.getUTCHours();
  var ap = "+0530";
 // hr = hr%12 || 12;

  // Format the output based on the adjusted UTC time
  var dt = days[d.getUTCDay()] + ' '
           + m[d.getUTCMonth()] + ' '
           + d.getUTCDate() + ' '
           
           + z(hr) + ':'
           + z(d.getUTCMinutes()) + ':'
           + z(d.getUTCSeconds()) + ' '
           + ap+ ' '
           + d.getUTCFullYear() ;
  return dt;
}


module.exports.getDashboards = async (req, res) => {

  let keywordData = await getKeywordData(req, res, [
    "id",
    "keyword",
    "dashboardJson",
    "postsWithSentiment",
    "wpath",
    "hashtagArray","fullStream","media"
  ]);
  if(keywordData.media=="Insta"){
  if (!keywordData) return res.redirect("/search");
  let influencers = _.uniqBy(keywordData.postsWithSentiment, "user_name");
  influencers = _.filter(influencers, person => person.followers_count >=con.config.influencerLimit || person.verified === true);
  let uni_posts =  _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "text"),["likes_count"],['desc'])
  //let alllocations = [];
  let unique_users = Object.keys(_.countBy(_.uniqBy(keywordData.postsWithSentiment, "user_name"), "user_id")).length;
  let DatesUtc = []
  let source = keywordData.postsWithSentiment;
  source.forEach(element => {
    DatesUtc.push(element.date)
    //alllocations.push(element.location)
  });
 
  // let uniqLocations = alllocations.reduce((acc, val) => {
  //   acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
  //   return acc;
  // }, {});
  // let location_array = [["location", "value"]];
  // for (var i in uniqLocations) {
  //   location_array.push([i, uniqLocations[i]]);
  // }
  //console.log(location_array)

  // let devices = count_source(source, "device");
  arr1 = instaValues(keywordData.postsWithSentiment);

  
  if (!keywordData) return res.redirect("/search");
  let hashes = counter(keywordData.hashtagArray)
  // return
  return res.render("dashboard/dashboard", {
    hashtag: keywordData.keyword,
    media:keywordData.media,
    stats: keywordData.dashboardJson,
    influencers: influencers,
    unique_posts : uni_posts,
    user_count: unique_users,
    feedb1: arr1,
    //devices_score: devices,
    path: keywordData.wpath,
    //location_array,
    //hashes,
    DatesUtc,hashes
  });
}
else{
  if (!keywordData) return res.redirect("/search");
  let influencers = _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "user_name"),["followers_count"],['desc'])
  influencers = _.filter(influencers, person => person.followers_count >=con.config.influencerLimit || person.verified === true);
  let uni_posts =  _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "text"),["retweet_count"],['desc'])
  let alllocations = [];
  let unique_users = Object.keys(_.countBy(_.uniqBy(keywordData.postsWithSentiment, "user_name"), "user_id")).length;
  let Dates = [];
  let DatesUtc = []
  let source = keywordData.postsWithSentiment;
  source.forEach(element => {
    DatesUtc.push(element.dateUTC)
    Dates.push(parseAndFormat(element.date));
    alllocations.push(element.location)
  });
  let uniqLocations = alllocations.reduce((acc, val) => {
    acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
    return acc;
  }, {});
  let location_array = [["location", "value"]];
  for (var i in uniqLocations) {
    location_array.push([i, uniqLocations[i]]);
  }
  //console.log(location_array)

  let devices = count_source(source, "device");
  arr1 = twitterValues(keywordData.postsWithSentiment);
 
  
  if (!keywordData) return res.redirect("/search");
  let hashes = counter(keywordData.hashtagArray)
  // return
  return res.render("dashboard/twitterDashboard", {
    hashtag: keywordData.keyword,
    stats: keywordData.dashboardJson,
    influencers: influencers,
    unique_posts : uni_posts,
    user_count: unique_users,
    feedb1: arr1,
    devices_score: devices,
    Dates,
    path: keywordData.wpath,
    location_array,
    hashes,
    DatesUtc,
    media:keywordData.media,
  });
}
};

/*
 ** Search page
 ** @Method : GET
 */

module.exports.getSearchPage = (req, res) => {
  if(Object.keys(req.body).length !=0)
   {
     console.log(req.body)
     Transaction.update({
     //orderId:req.body.orderId,
     orderAmount:req.body.orderAmount,
     referenceId:req.body.referenceId,
     txStatus:req.body.txStatus,
     paymentMode:req.body.paymentMode,
     txMsg:req.body.txMsg,
     txTime:req.body.txTime,
     signature:req.body.signature,
   },
   { where: { orderId : req.body.orderId }} 
   
   ).then(function() {

     //console.log("Project with id =1 updated successfully!");
     return res.render("dashboard/search");
 }).catch(function(e) {
     console.log("Project update failed !");
 }); 

   
  }
  else
  {
   return res.render("dashboard/search");
  }
};

/*
 ** Buzzword page
 ** @Method : GET
 */
module.exports.getBuzzwords = async (req, res) => {
  
    let keywordData = await getKeywordData(req, res, [
      "id",
      "wpath",
      "keyword",
      "hashtagArray","media"
    ]);
    if(keywordData.media=="Insta"){
    if (!keywordData) return res.redirect("/search");
    let hashes = counter(keywordData.hashtagArray)
    return res.render("dashboard/buzzwords", {
      hashtag: req.session.hashtag,
      hashes,
      path: keywordData.wpath,
      media:keywordData.media,
    });
  }
  else{
    if (!keywordData) return res.redirect("/search");
    let hashes = counter(keywordData.hashtagArray)
    return res.render("dashboard/twitterBuzzwords", {
      hashtag: req.session.hashtag,
      hashes,
      path: keywordData.wpath,
      media:keywordData.media,
    });
  }
  
};

/*
 ** Posts page
 ** @Method : GET
 */

module.exports.getPosts = async (req, res) => {
  // to key keyword data
  
  let keywordData = await getKeywordData(req, res, [
    "id",
    "postsWithSentiment",
    "keyword","media"
  ]);
  if(keywordData.media=="Insta"){
 
  if (!keywordData) return res.redirect("/search");

  let posts =  _.uniqBy(keywordData.postsWithSentiment, "text");

  return res.status(200).render("dashboard/posts", {
    hashtag: req.session.hashtag,
    id: keywordData.id,
    posts,
    media:keywordData.media,
  });
}
else{
  if (!keywordData) return res.redirect("/search");

  let posts =  _.uniqBy(keywordData.postsWithSentiment, "text");

  return res.status(200).render("dashboard/twitterPosts", {
    hashtag: req.session.hashtag,
    id: keywordData.id,
    posts,
    media:keywordData.media,
  });

}
}

/*
 ** Influencers page
 ** @Method : GET
 */

module.exports.getInfluencers = async (req, res) => {
  let keywordData = await getKeywordData(req, res, [
    "id",
    "postsWithSentiment",
    "keyword","media"
  ]);
  if(keywordData.media=="Insta"){
  if (!keywordData) return res.redirect("/search");

  let influencers = _.uniqBy(keywordData.postsWithSentiment, "user_name");
  influencers = _.filter(influencers, person => person.followers_count >=con.config.influencerLimit || person.verified === true);
  
  
  let posts = keywordData.postsWithSentiment;

  let influencersData = {};
  for (let i = 0; i < influencers.length; i++) {
    influencersData[i] = influencers[i];
    let userPosts = posts.filter(item => {
      return item.user_id === influencers[i].user_id;
    });
    let totalEngagement = 0;
    influencersData[i].posts = userPosts.map(i => {
      totalEngagement += i.retweet_count + i.followers_count;
      return {
        text: i.text,
        date: i.date,
        engagement: i.likes_count + i.comments_count,
        url :i.url ,
      };
    });

    influencersData[i].totalEngagement = totalEngagement;
  }
  return res.render("dashboard/influencers", {
    hashtag: req.session.hashtag,
    usr_array: influencers,
    posts,
    influencersData,
    media:keywordData.media,
  });
}
else{
  if (!keywordData) return res.redirect("/search");

  //let influencers = _.uniqBy(keywordData.postsWithSentiment, "user_name");
  let influencers = _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "user_name"),["followers_count"],['desc'])
  influencers = _.filter(influencers, person => (person.followers_count >=con.config.influencerLimit || person.verified === true));
  let posts = keywordData.postsWithSentiment;

  let influencersData = {};
  for (let i = 0; i < influencers.length; i++) {
    influencersData[i] = influencers[i];
    let userPosts = posts.filter(item => {
      return item.user_id === influencers[i].user_id;
    });
    let totalEngagement = 0;
    influencersData[i].posts = userPosts.map(i => {
      totalEngagement += i.retweet_count + i.followers_count;
      return {
        text: i.text,
        date: i.date,
        engagement: i.retweet_count + i.followers_count,
        url :i.url ,
      };
    });

    influencersData[i].totalEngagement = totalEngagement;
  }
  return res.render("dashboard/twitterInfluencers", {
    hashtag: req.session.hashtag,
    usr_array: influencers,
    posts,
    influencersData,
    media:keywordData.media,
  });

}
}

/*
 ** Sentiment page
 ** @Method : GET
 */

module.exports.getSentiment = async (req, res) => {
  let keywordData = await getKeywordData(req, res, [
    "id",
    "dashboardJson",
    "keyword","media"
  ]);
  if(keywordData.media=="Insta"){
  if (!keywordData) return res.redirect("/search");

  return res.status(200).render("dashboard/sentiment", {
    hashtag: req.session.hashtag,
    feedback1: keywordData.dashboardJson.positive_score_percent,
    feedback2: keywordData.dashboardJson.negative_score_percentage,
    feedback3: keywordData.dashboardJson.neutral_score_percentage,
    media:keywordData.media,
  });
}
else{
  if (!keywordData) return res.redirect("/search");

  return res.status(200).render("dashboard/twitterSentiment", {
    hashtag: req.session.hashtag,
    feedback1: keywordData.dashboardJson.positive_score_percent,
    feedback2: keywordData.dashboardJson.negative_score_percentage,
    feedback3: keywordData.dashboardJson.neutral_score_percentage,
    media:keywordData.media,
  });
}
};

module.exports.myPlan = (req,res)=>{
return res.render("dashboard/myplan")

}
module.exports.getRecents = async (req, res) => {
  let recent = await Keyword.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col("keyword")), 'keyword']], // to get only selected columns
    where: { UserId: req.session.user.id },
    raw:true
  });
  res.render("dashboard/recents", {
    hashtag: req.session.hashtag,
    recents: recent,
  });
};

module.exports.deleteRecord = async(req,res)=>{
  Keyword.destroy({
    where: {UserId :req.session.user.id,keyword:req.params.key
    }
}).then(async function(){ // rowDeleted will return number of rows deleted
  let recent = await Keyword.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col("keyword")), 'keyword']], // to get only selected columns
    where: { UserId: req.session.user.id },
    raw:true
  });
  res.render("dashboard/recents", {
    hashtag: req.session.hashtag,
    recents: recent,
  });
   }
, function(err){
    console.log(err); 
});
}
