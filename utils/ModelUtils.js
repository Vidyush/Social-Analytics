const Keyword = require("../models/keyword");

module.exports.getKeywordData = function(req, res, attributes = []) {
  return new Promise(async (resolve, reject) => {
    let key = null;
    let { user } = req.session;
    let media = null;
    // to find selected searched response
    if (req.params.key && req.params.media){ 
      key = req.params.key
      media = req.params.media
    }
    // to find keyword as per id
    else if (req.session.keyword.name) 
    {
      key = req.session.keyword.name
    media = req.session.keyword.media}
     

    let keywordData;

    if (!key) {
      keywordData = await Keyword.findOne({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
        attributes
      });

      if (keywordData) {
        req.session.keyword = { id: keywordData.id, name: keywordData.keyword ,media:keywordData.media};
        res.locals.keyword = { id: keywordData.id, name: keywordData.keyword ,media:keywordData.media};
      }
    } else {
      keywordData = await Keyword.findOne({
        where: { userId: user.id,
        keyword:key,
      media:media },
        attributes
      });
      // setting session keyword info based on search history
      if (req.params.key) {
        req.session.keyword = {
          id: keywordData.id,
          name: keywordData.keyword,
          media: keywordData.media
        };
        res.locals.keyword = req.session.keyword;
      }
    }

    resolve(keywordData);
    if (false) reject("fake rejection handling");
  });
};