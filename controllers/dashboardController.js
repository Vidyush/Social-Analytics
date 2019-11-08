// Dashboard Controller
const Keyword = require("../models/keyword");
const _ = require("lodash");
const Transaction = require("../models/transaction");
const { getKeywordData } = require("../utils/ModelUtils");


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



module.exports.getDashboards = async (req, res) => {
  // return res.json({session :req.session, id: req.params.id });
  let keywordData = await getKeywordData(req, res, [
    "id",
    "keyword",
    "dashboardJson",
    "postsWithSentiment",
    "dateJson",
    "rhpath",
    "wpath"
  ]);

  if (!keywordData) return res.redirect("/search");
  let influencers = _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "user_name"),["followers_count"],['desc'])
  let uni_posts =  _.orderBy(_.uniqBy(keywordData.postsWithSentiment, "text"),["retweet_count"],['desc'])
  let alllocations = [];
  let unique_users = Object.keys(_.countBy(influencers, "user_id"))
    .length;
  let Dates = [];
  let source = keywordData.postsWithSentiment;
  source.forEach(element => {
    Dates.push(element.date);
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
  let student2 = JSON.parse(keywordData.dateJson);

  var totalMessages1 = Object.keys(student2).length;

  let array1 = new Array(totalMessages1);
  for (let i = 0; i < totalMessages1; i++) {
    array1[i] = new Array();
  }

  for (let a = 0; a < totalMessages1; a++) {
    array1[a][0] = student2[a].V1;
    array1[a][1] = student2[a].V2;
    array1[a][2] = student2[a].V3;
    array1[a][3] = student2[a].V4;
    array1[a][4] = student2[a].V5;
    array1[a][5] = student2[a].V6;
    array1[a][6] = student2[a].V7;
    array1[a][7] = student2[a].V8;
    array1[a][8] = student2[a].V9;
    array1[a][9] = student2[a].V10;
    array1[a][10] = student2[a].V11;
    array1[a][11] = student2[a].V12;
  }
  arr1 = array1;

  if (!keywordData) return res.redirect("/search");

  // return
  return res.render("dashboard/dashboard", {
    hashtag: keywordData.keyword,
    stats: keywordData.dashboardJson,
    influencers: influencers,
    unique_posts : uni_posts,
    user_count: unique_users,
    feedb1: arr1,
    devices_score: devices,
    Dates,
    path: [keywordData.rhpath, keywordData.wpath]
  });
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
  if (!req.session.currentId) {
    let keywordData = await getKeywordData(req, res, [
      "id",
      "wpath",
      "rhpath",
      "keyword"
    ]);
    if (!keywordData) return res.redirect("/search");
  
    return res.render("dashboard/buzzwords", {
      hashtag: req.session.hashtag,
      path: [keywordData.wpath, keywordData.rhpath]
    });
  } else {
    Keyword.findOne({
      where: {
        UserId: req.session.user.id,
        Id: req.session.currentId
      }
    }).then(key => {
      return res.render("dashboard/buzzwords", {
        hashtag: key.keyword,
        path: [key.wpath, key.rhpath]
      });
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
    "keyword"
  ]);
  if (!keywordData) return res.redirect("/search");

  let posts =  _.uniqBy(keywordData.postsWithSentiment, "text");

  return res.status(200).render("dashboard/posts", {
    hashtag: req.session.hashtag,
    id: keywordData.id,
    posts
  });
};

/*
 ** Influencers page
 ** @Method : GET
 */

module.exports.getInfluencers = async (req, res) => {
  let keywordData = await getKeywordData(req, res, [
    "id",
    "postsWithSentiment",
    "keyword"
  ]);
  if (!keywordData) return res.redirect("/search");

  let influencers = _.uniqBy(keywordData.postsWithSentiment, "user_name");
  influencers = _.filter(influencers, person => person.followers_count >=500 || person.verified === true);
  
  
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
        engagement: i.retweet_count + i.followers_count
      };
    });

    influencersData[i].totalEngagement = totalEngagement;
  }
  return res.render("dashboard/influencers", {
    hashtag: req.session.hashtag,
    usr_array: influencers,
    posts,
    influencersData
  });
};

/*
 ** Sentiment page
 ** @Method : GET
 */

module.exports.getSentiment = async (req, res) => {
  let keywordData = await getKeywordData(req, res, [
    "id",
    "dashboardJson",
    "keyword"
  ]);
  if (!keywordData) return res.redirect("/search");

  return res.status(200).render("dashboard/sentiment", {
    hashtag: req.session.hashtag,
    feedback1: keywordData.dashboardJson.positive_score_percent,
    feedback2: keywordData.dashboardJson.negative_score_percentage,
    feedback3: keywordData.dashboardJson.neutral_score_percentage
  });
};

module.exports.myPlan = (req,res)=>{
return res.render("dashboard/myplan")

}
module.exports.getRecents = async (req, res) => {
  let recent = await Keyword.findAll({
    attributes: ["keyword", "dashboardJson", "id"], // to get only selected columns
    where: { UserId: req.session.user.id }
  });
  res.render("dashboard/recents", {
    hashtag: req.session.hashtag,
    recents: recent
  });
};

module.exports.getonlyRecents = async (req, res) => {
  let recent = await Keyword.findAll({
    attributes: ["keyword", "dashboardJson", "id"], // to get only selected columns
    where: { UserId: req.session.user.id }
  });

  res.render("dashboard/onlyrecent", {
    recents: recent
  });
};
