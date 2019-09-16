// Dashboard Controller
const Keyword = require("../models/keyword");
const _=require("lodash")
const Transaction = require("../models/transaction");

function count_source(source){
  let st = [];
  source.forEach(s=>{
    st.push(s.source)
  })
  let new_arr = []
st.forEach(function(tag){
  //console.log(tag);
  new_arr.push(tag.match(/<a.*>(Twitter )?(for )?(.*)<\/a>/)[3]);
});

var uniqs = new_arr.reduce((acc, val) => {
  acc[val] = acc[val] === undefined ? 1 : acc[val] += 1;
  return acc;
}, {});

let score_array = [["device","value"]];
for(var i in uniqs) {
    score_array.push([i, uniqs[i]]);
}
//console.log(data)
return(score_array);
}

function convertDate(d){
  var parts = d.split(" ");
  // var months = {
  //  Jan: "01",
  //  Feb: "02",
  //  Mar: "03",
  //  Apr: "04",
  //  May: "05",
  //  Jun: "06",
  //  Jul: "07",
  //  Aug: "08",
  //  Sep: "09",
  //  Oct: "10",
  //  Nov: "11",
  //  Dec: "12"
  // };


  var months = {
    Jan: "Jan",
    Feb: "Feb",
    Mar: "Mar",
    Apr: "Apr",
    May: "May",
    Jun: "Jun",
    Jul: "Jul",
    Aug: "Aug",
    Sep: "Sep",
    Oct: "Oct",
    Nov: "Nov",
    Dec: "Dec"
   };


  //return parts[2]+"-"+months[parts[1]]+"-"+parts[5];
  return parts[2]+" "+months[parts[1]];
 }

 

module.exports.getDashboards = (req, res) => {
  
  if(!req.params.id)
  { 
    Keyword.findOne({
    where: {
    user: req.session.user.email,
    keyword : req.session.hashtag
    }
  })
  .then(key => {
    let allData = JSON.parse(JSON.stringify(key.fullStream));
    
    let student = JSON.parse(key.dashboardJson);  
    var data1 = [];
    data1[0] = student[0]["total_tweets"];
    data1[1] = student[0]["total_retweets"];
    data1[2] = student[0]["engagement_level"];
    data1[3] = student[0]["total_fav"];
    data1[4] = student[0]["fav_per"];
    data1[5] = student[0]["pos"];
    data1[6] = student[0]["neu"];
    data1[7] = student[0]["neg"];
    data1[8] = key.keyword;
    test = data1;
    
    let student2 = JSON.parse(key.dateJson); 

      var totalMessages1 = Object.keys(student2).length;
           
      let array1 = new Array(totalMessages1);   
      for(let i = 0; i < totalMessages1; i++) {
        array1[i] = new Array();         
      }
      
      for(let a = 0;a<totalMessages1;a++){       
          array1[a][0]=student2[a].V1;
          array1[a][1]=student2[a].V2;
          array1[a][2]=student2[a].V3;
          array1[a][3]=student2[a].V4;
          array1[a][4]=student2[a].V5;
          array1[a][5]=student2[a].V6;
          array1[a][6]=student2[a].V7;
          array1[a][7]=student2[a].V8;
          array1[a][8]=student2[a].V9;
          array1[a][9]=student2[a].V10;
          array1[a][10]=student2[a].V11;
          array1[a][11]=student2[a].V12;
      }
      arr1 = array1;

    let wordcloud_paths = [key.rhpath,key.wpath];
    let Dates = [];
allData.forEach(element => {
  Dates.push(element.created_at)
}) 


let source = req.session.usr_array;
devices = count_source(source);
//console.log(devices);

let sorted_posts_array = [...req.session.usr_array];
let sorted_users_array = [...req.session.usr_array];
sorted_posts_array = sorted_posts_array.sort(function(a,b){
      
  return (b.retweet_count-a.retweet_count);
 });
sorted_users_array = sorted_users_array.sort(function(a,b){
      
  return (b.followers_count-a.followers_count);
 });

let sorted_posts_users_array = [sorted_posts_array,sorted_users_array]

return res.render("dashboard/dashboard",{devices_score:devices,hashtag:req.session.hashtag,feedback :test, feedb : sorted_posts_users_array, feedb1:arr1,Dates,path:wordcloud_paths,feedback1 :test[5], feedback2 :test[7], feedback3: test[6]});})
   }

    else{
    Keyword.findOne({
      where: {
      user: req.session.user.email,
      id:req.params.id
      }
    })
    .then(key => {

      let student = JSON.parse(key.dashboardJson);  
      var data1 = [];
      data1[0] = student[0]["total_tweets"];
      data1[1] = student[0]["total_retweets"];
      data1[2] = student[0]["engagement_level"];
      data1[3] = student[0]["total_fav"];
      data1[4] = student[0]["fav_per"];
      data1[5] = student[0]["pos"];
      data1[6] = student[0]["neu"];
      data1[7] = student[0]["neg"];
      data1[8] = key.keyword;
      test = data1;

      let wordcloud_paths = [key.rhpath,key.wpath,key.mapcloud];
       
       let sw = JSON.parse(JSON.stringify(key.fullStream));     
        var myArray = new Array();
                            
   sw.forEach(element => {
     if(element.retweeted = "false"){
   var d = element.created_at;
     
    myArray.push({
   
        date: convertDate(d),
        text: element.text,
        retweet_count: element.retweet_count,
        user_name: element.user.name,
        favorite_count: element.favorite_count,
        location: element.user.location,
        url:UrlGetter(element.text),
        profile_link : "https://twitter.com/"+element.user.screen_name
   
    });
   
   }});

   let student2 = JSON.parse(key.dateJson); 

   let totalMessages1 = Object.keys(student2).length;
        
   let array1 = new Array(totalMessages1);   
   for(let i = 0; i < totalMessages1; i++) {
     array1[i] = new Array();         
   }
   
   for(let a = 0;a<totalMessages1;a++){       
       array1[a][0]=student2[a].V1;
       array1[a][1]=student2[a].V2;
       array1[a][2]=student2[a].V3;
       array1[a][3]=student2[a].V4;
       array1[a][4]=student2[a].V5;
       array1[a][5]=student2[a].V6;
       array1[a][6]=student2[a].V7;
       array1[a][7]=student2[a].V8;
       array1[a][8]=student2[a].V9;
       array1[a][9]=student2[a].V10;
       array1[a][10]=student2[a].V11;
       array1[a][11]=student2[a].V12;
   }
   arr1 = array1;
     
   //let wordcloud_paths = [key.rhpath,key.wpath];
    
   //return res.render("dashboard/buzzwords", {feedback4: req.session.hashtag,path:wordcloud_paths});
   

         
    return res.render("dashboard/recentDashboard",{feedback:test,feedb:myArray,feedb1: arr1,path:wordcloud_paths});

    })
    .catch(err => console.log(err));
  }

};

module.exports.getSearchPage = (req, res) => {

   if(Object.keys(req.body).length !=0)
   {
    //console.log(req.body)
    Transaction.create({
      orderId:req.body.orderId,
    }); 
    return res.render("dashboard/search");
   }
   else
   {
    return res.render("dashboard/search");
   }
   

};

module.exports.getBuzzwords = (req,res)=>{

  console.log(req.params.id);
  if(!req.params.id){
  Keyword.findOne({
    where: {
      user: req.session.user.email,
      keyword:req.session.hashtag
    }
  })
  .then(key => {

   let wordcloud_paths = [key.rhpath,key.wpath];
    
    return res.render("dashboard/buzzwords", {hashtag: req.session.hashtag,path:wordcloud_paths});
    
  })
  .catch(err => console.log(err));
}
else{
  Keyword.findOne({
    where: {
      user: req.session.user.email,
      id:req.params.id
    }
  })
  .then(key => {

   let wordcloud_paths = [key.rhpath,key.wpath];
      return res.render("dashboard/recentBuzzwords", {path:wordcloud_paths});
  })
  .catch(err => console.log(err));
}
};


module.exports.getPosts = (req,res)=>{
  if(!req.params.id){
    
 
 return res.render("dashboard/posts",{hashtag: req.session.hashtag,usr_array:req.session.usr_array})

   }
   else{
     Keyword.findOne({
     where: {
       user: req.session.user.email,
       id:req.params.id
     }
   })
   .then(key => {
     let wordcloud_paths = [key.mapcloud];
     let sw = JSON.parse(JSON.stringify(key.fullStream));
    
     var usr_array = new Array();
       sw.forEach(element => {
         if(element.retweeted ='false')
         {var d = element.created_at;
 
         usr_array.push({
          url:element.entities.urls[0]['url'],
           text :element.text,
           source:element.source,
           score: getScore(element.id_str),
           user_id : element.user.id,
           user_name:element.user.name,
           screen_name:element.user.screen_name,
           location:element.user.location,
           description:element.user.description,
           followers_count:element.user.followers_count,
           friends_count:element.user.friends_count,
           listed_count:element.user.listed_count,
           favourites_count:element.user.favourites_count,
           statuses_count:element.user.statuses_count,
           user_lang:element.user.lang,
           profile_background_image_url:element.user.profile_background_image_url,
           profile_image_url:element.user.profile_image_url,
           retweet_count:element.retweet_count,
           date : convertDate(d)
       })
     }})
     let unique = _.uniqBy(usr_array, 'user_id');
   
   return res.render("dashboard/posts",{id:req.params.id,feedback4: req.session.hashtag,feedback : req.session.test, user_feb : unique,mpath:wordcloud_paths})
 })
 .catch(err => console.log(err));
     }

};


module.exports.getInfluencers = (req,res)=>{
   if(!req.params.id){
    let influencers = _.uniqBy(req.session.usr_array , "user_name")
    let posts = [...req.session.usr_array]
 
 return res.render("dashboard/influencers",{hashtag: req.session.hashtag,usr_array:influencers,posts})

   }
    else{
      Keyword.findOne({
      where: {
        user: req.session.user.email,
        id:req.params.id
      }
    })
    .then(key => {
      let wordcloud_paths = [key.mapcloud];
      let sw = JSON.parse(JSON.stringify(key.fullStream));
     
      var usr_array = new Array();
        sw.forEach(element => {
          if(element.retweeted ='false')
          {var d = element.created_at;
  
          usr_array.push({
            text :element.text,
            source:element.source,
            user_id : element.user.id,
            user_name:element.user.name,
            screen_name:element.user.screen_name,
            location:element.user.location,
            description:element.user.description,
            followers_count:element.user.followers_count,
            friends_count:element.user.friends_count,
            listed_count:element.user.listed_count,
            favourites_count:element.user.favourites_count,
            statuses_count:element.user.statuses_count,
            user_lang:element.user.lang,
            profile_background_image_url:element.user.profile_background_image_url,
            profile_image_url:element.user.profile_image_url,
            retweet_count:element.retweet_count,
            date : convertDate(d)
        })
      }})
      let unique = _.uniqBy(usr_array, 'user_id');
    
    return res.render("dashboard/influencers",{id:req.params.id,feedback4: req.session.hashtag,feedback : req.session.test, user_feb : unique,mpath:wordcloud_paths})
  })
  .catch(err => console.log(err));
      }

};

module.exports.getSentiment = (req,res)=>{
  if(!req.params.id)
  
    { 
      Keyword.findOne({
      where: {
      user: req.session.user.email,
      keyword : req.session.hashtag
      }
    })
    .then(key=>{
      let student = JSON.parse(key.dashboardJson);  
    var data1 = [];
    data1[0] = student[0]["total_tweets"];
    data1[1] = student[0]["total_retweets"];
    data1[2] = student[0]["engagement_level"];
    data1[3] = student[0]["total_fav"];
    data1[4] = student[0]["fav_per"];
    data1[5] = student[0]["pos"];
    data1[6] = student[0]["neu"];
    data1[7] = student[0]["neg"];
    data1[8] = key.keyword;
    test = data1;
    })
    return res.render("dashboard/sentiment",{hashtag: req.session.hashtag, feedback1 : test[5], feedback2 :test[7], feedback3:test[6]})
  }
    else{
    Keyword.findOne({
      where: {
        user: req.session.user.email,
      id:req.params.id
      }
    })
    .then(key => {

      let student = JSON.parse(key.dashboardJson);  
      var data1 = [];
      data1[0] = student[0]["total_tweets"];
      data1[1] = student[0]["total_retweets"];
      data1[2] = student[0]["engagement_level"];
      data1[3] = student[0]["total_fav"];
      data1[4] = student[0]["fav_per"];
      data1[5] = student[0]["pos"];
      data1[6] = student[0]["neu"];
      data1[7] = student[0]["neg"];
      data1[8] = key.keyword;
      test = data1;

      let wordcloud_paths = [key.rhpath,key.wpath];
       
      let sw = JSON.parse(JSON.stringify(key.fullStream));     
      var myArray = new Array();
                            
   sw.forEach(element => {
     if(element.retweeted = 'false'){
   var d = element.created_at;
     
    myArray.push({
   
        date: convertDate(d),
        text: element.text,
        retweet_count: element.retweet_count,
        user_name: element.user.name,
        favorite_count: element.favorite_count,
        location: element.user.location,
        url:UrlGetter(element.text),
        profile_link : "https://twitter.com/"+element.user.screen_name
   
    });
   
   }});

   let student2 = JSON.parse(key.dateJson); 

   let totalMessages1 = Object.keys(student2).length;
        
   let array1 = new Array(totalMessages1);   
   for(let i = 0; i < totalMessages1; i++) {
     array1[i] = new Array();         
   }
   
   for(let a = 0;a<totalMessages1;a++){       
       array1[a][0]=student2[a].V1;
       array1[a][1]=student2[a].V2;
       array1[a][2]=student2[a].V3;
       array1[a][3]=student2[a].V4;
       array1[a][4]=student2[a].V5;
       array1[a][5]=student2[a].V6;
       array1[a][6]=student2[a].V7;
       array1[a][7]=student2[a].V8;
       array1[a][8]=student2[a].V9;
       array1[a][9]=student2[a].V10;
       array1[a][10]=student2[a].V11;
       array1[a][11]=student2[a].V12;
   }
   arr1 = array1;
         
   return res.render("dashboard/recentSentiment",{feedback : test, feedback1 : test[5], feedback2 :test[7], feedback3: test[6], feedb: myArray, feedb1:arr1})
  
    })
    .catch(err => console.log(err));
  }


};

module.exports.getRecents= async(req,res)=>{
  let recent = await Keyword.findAll({
    attributes: ['keyword', 'count','id'], // to get only selected columns
    where:{user: req.session.user.email}
});

res.render('dashboard/recents', {
    recents: recent,feedback4: req.session.hashtag
});
}

module.exports.getonlyRecents= async(req,res)=>{
  let recent = await Keyword.findAll({
    attributes: ['keyword', 'count','id'], // to get only selected columns
    where:{user: req.session.user.email}
});


res.render('dashboard/onlyrecent', {
    recents: recent

    
});

}