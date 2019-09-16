const TwitterApi = require("../utilities/twitter_keys")
const AlgorithmiaApi = require("../utilities/algorithmia_keys")
const fs = require("fs")
const Keyword = require("../models/keyword");
const _ = require("lodash");


function cloud_save(path,filename){
  AlgorithmiaApi.file(path).exists( function(exists) {
    if (exists == true) {
        // Download contents of file as a string
        AlgorithmiaApi.file(path).get(async function(err, data) {
            if (err) {
                console.log("Failed to download file.");
                console.log(err);
            } else {
             await fs.writeFile("public/wordclouds/"+filename, data,function(err) {
             // If an error occurred, show it and return
             if(err) return console.error(err);
             // Successfully wrote binary contents to the file!
             else console.log("downloaded")
           });
         }
           });
    }
});

}

function convertDate(d){
  var parts = d.split(" ");
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
 
module.exports.analyseTwitterData =  (req,res)=>{
    let body = req.body;
    let hashtag =body.hashtag;
    req.session.hashtag = hashtag;        
TwitterApi.get('search/tweets', { q: hashtag,count: 100}, function(err, data, response) { 
  let allData = JSON.parse(JSON.stringify(data.statuses));
  
  function getScore(id) {
    let getScore = score.find(x => x.id_str === id);
    return(getScore.Score)   
  }  
  
  function UrlGetter(id){
    let getUrl = allData.find(x => x.id_str === id);
    getUrl =getUrl.entities.urls;
    console.log(getUrl)
    if(getUrl.length>0)
    {
      getUrl = getUrl.find(x=>x['url'])
      return(getUrl.url);
    }
    else{
      return "";
    }
    //console.log(getUrl)
   }
  AlgorithmiaApi.algo("Vidyush/Score/0.1.6")
  .pipe(JSON.stringify(data.statuses))
  .then(function(response) {
  score = JSON.parse(response.get());
   req.session.score = score; 
  
  var usr_array = new Array();
      allData.forEach(element => {
        if(element.retweeted = 'false'){
        var d = element.created_at;

        usr_array.push({
          url:UrlGetter(element.id_str),
          text :element.text,
          profile_link : "https://twitter.com/"+element.user.screen_name,
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
      
      }
})
usr_array = _.uniqBy(usr_array, 'text');
req.session.usr_array = usr_array;
res.render("dashboard/posts",{usr_array,hashtag})
})          

AlgorithmiaApi.algo("Vidyush/Test/0.11.1") 
     .pipe(JSON.stringify(data.statuses))
     .then(function(response) {
     xyz = response.get();
     console.log(xyz);

      AlgorithmiaApi.algo("Vidyush/Forth/0.1.2")
      .pipe(JSON.stringify(data.statuses))
      .then(function(response) {
      third = response.get();

      let tweetData = JSON.parse(JSON.stringify(data.statuses))
      let string = ""
      tweetData.forEach(elem=>{
         string = string.concat(elem.text)
      })
      AlgorithmiaApi.algo("Vidyush/wordcloud/0.2.5")
      .pipe(string)
      .then(async function(response) {
      wpath = response.get()
      
      let student = JSON.parse(xyz);  
      //keyss gives access to the rows if user and keyword matches in the db 
      //we can use keys to set new values to the db in that particular row.
      w=wpath.substring(36, )
      r=student[0]["rhFileName"].substring(31, )
      const keyss = await Keyword.findOne({
        where:{
          keyword: hashtag,
          user: req.session.user.email
        }
      })
    
    if(keyss){
      keyss.wpath = "public/wordclouds/"+w
      keyss.rhpath = "public/wordclouds/"+r
      keyss.fullStream = data.statuses
            keyss.dashboardJson = xyz
            keyss.dateJson = third
            keyss.score = score
            keyss.count = keyss.count + 1
            keyss.save().then(()=>{
              console.log("updated")
            }).catch(err=>{
              console.log(err);
            })
          }
          else{
        try {
          Keyword.create({
            keyword: hashtag,
            user: req.session.user.email,
            wpath : "public/wordclouds/"+w,
            rhpath : "public/wordclouds/"+r,
            score : score,
            fullStream:data.statuses,
            dashboardJson:xyz,
            dateJson:third,
          }); 
        } catch (err) {
          console.log(err);
        }
      }
            
        cloud_save(student[0]["rhFileName"],r);
        cloud_save(wpath,w);
        console.log("fin")
            })
      })
    })
})
}
