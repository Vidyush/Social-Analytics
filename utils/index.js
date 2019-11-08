// # to get all hashtags from the string
const HASHTAG_REGEX_STRING = /#\S+/g;

const getHashTagsAll = s => {

  return s.match(HASHTAG_REGEX_STRING);
};

module.exports = {
  HASHTAG_REGEX_STRING,
  getHashTagsAll
};
