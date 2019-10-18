// # to get all hashtags from the string
const HASHTAG_REGEX_STRING = /#[a-z]+/gi;

const getHashTagsAll = s => {
  return s.match(HASHTAG_REGEX_STRING);
};

module.exports = {
  HASHTAG_REGEX_STRING,
  getHashTagsAll
};
