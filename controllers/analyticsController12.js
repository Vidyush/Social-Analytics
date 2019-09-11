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

function getScore(id) {
  console.log(id)
  let getScore = s.find(x => x.id_str === id);
  console.log(getScore)
  return(getScore.Score)   
}  


module.exports.analyseTwitterData =  (req,res)=>{
    let body = req.body;
    let hashtag =body.hashtag;
            
TwitterApi.get('search/tweets', { q: hashtag,count: 100}, function(err, data, response) { 
    //console.log(data.statuses);
    //console.log(hashtag);
    req.session.allData = data.statuses;
    req.session.hashtag = hashtag;
    fs.writeFile('2pac.txt', JSON.stringify(data.statuses), (err) => {  
      // throws an error, you could also catch it here
      if (err) throw err;
  
      // success case, the file was saved
      console.log('Lyric saved!');
  });


    AlgorithmiaApi.algo("Vidyush/Score/0.1.6")
    .pipe(JSON.stringify(data.statuses))
    .then(function(response) {
    score = response.get();
    s = JSON.parse(score) 

    req.session.s = s;

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
      .then(function(response) {
      wpath = response.get()

      let location = ""
        tweetData.forEach(elem=>{
           location = location.concat(elem.user.location)
        })
        AlgorithmiaApi.algo("Vidyush/Map/0.4.1")
      .pipe(location)
      .then(async function(response) {
          mpath=response.get();
  
      let student = JSON.parse(xyz);  
      console.log(student[0]["rhFileName"]);
      var data1 = [];
      data1[0] = student[0]["total_tweets"];
      data1[1] = student[0]["total_retweets"];
      data1[2] = student[0]["engagement_level"];
      data1[3] = student[0]["total_fav"];
      data1[4] = student[0]["fav_per"];
      data1[5] = student[0]["pos"];
      data1[6] = student[0]["neu"];
      data1[7] = student[0]["neg"];
      data1[8] = hashtag;
      test = data1;
      
      //keyss gives access to the rows if user and keyword matches in the db 
      //we can use keys to set new values to the db in that particular row.
      w=wpath.substring(36, )
      m=mpath.substring(30, )
      
      r=student[0]["rhFileName"].substring(31, )
     wordcloud_paths=["public/wordclouds/"+r, "public/wordclouds/"+w]

    const keyss = await Keyword.findOne({
      where:{
        keyword: hashtag,
        user: req.session.user.email
      }
    })
   
    //console.log(keyss);
    
  if(keyss){
    keyss.wpath = "public/wordclouds/"+w
    keyss.rhpath = "public/wordclouds/"+r
    keyss.mapcloud = "public/wordclouds/"+m
          keyss.fullStream = data.statuses
          keyss.dashboardJson = xyz
          keyss.dateJson = third
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
          mapcloud :"public/wordclouds/"+m,
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
      cloud_save(mpath,m);
       

      let sw = JSON.parse(JSON.stringify(data.statuses)); 
       //console.log(sw);
       
        var myArray = new Array();
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
          function UrlGetter(x){
            x = x.split(" ")
            return(x.pop())
          }
          
sw.forEach(element => {
  if(element.retweeted ="false"){
  var d = element.created_at;
  
  
    myArray.push({

        date: convertDate(d),
        //date: '2 Aug',
        text: element.text,
        profile_image_url:element.user.profile_image_url,
        retweet_count: element.retweet_count,
        user_name: element.user.name,
        favorite_count: element.favorite_count,
        location: element.user.location,
        url:UrlGetter(element.text),
        profile_link : "https://twitter.com/"+element.user.screen_name

    });
}});

let Dates = [];
sw.forEach(element => {
  Dates.push(element.created_at)
})
console.log(Dates)
let unique = _.uniqBy(myArray, 'text');
arr = unique;
// console.log(arr);
      let student2 = JSON.parse(third); 

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

      //out2
      var usr_array = new Array();
      sw.forEach(element => {
        if(element.retweeted = 'false'){
        var d = element.created_at;

        usr_array.push({
          url:UrlGetter(element.text),
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
    req.session.test = test;
    req.session.influencer = usr_array;
    req.session.arr = arr;
    req.session.arr1 = arr1;
    req.session.dates= Dates;
    req.session.paths = wordcloud_paths;

    res.render('dashboard/posts',{feedback4:req.session.hashtag,feedback:test,feedb:arr,feedb1:arr1,Dates,path:wordcloud_paths,user_feb:usr_array,feedback1 : req.session.test[5], feedback2 :req.session.test[7], feedback3: req.session.test[6]});
      })   
  })
    })
      
      
})
    })


})
}


