'use srict'

let trim = (x) => {
    let value = String(x)
    return value.replace(/^\s+|\s+$/gm, '')
}
let isEmpty = (value) => {
    if (value === null || value === undefined || trim(value) === '' || value.length === 0) {
        return true
    } else {
        return false
    }
}






function compare(a, b) {
    const dateA = new Date(a.commentCreatedOn);
    const dateB = new Date(b.commentCreatedOn);
    
    return dateA - dateB


  }

  function comparePost(a, b) {
    
    const dateA = new Date(a.postCreatedOn);
    const dateB = new Date(b.postCreatedOn);
    
    return dateB - dateA
  }


  function compareReply(a, b) {
    // const genreA = a.replyCreatedOn;
    // const genreB = b.replyCreatedOn;

    const dateA = new Date(a.replyCreatedOn);
    const dateB = new Date(b.replyCreatedOn);
    
    // let comparison = 0;
    // if (genreA > genreB) {
    //   comparison = -1;
    // } else if (genreA < genreB) {
    //   comparison = 1;
    // }
    // return comparison;
    return dateA - dateB
  }
  
//   console.log(bands.sort(compare));
  
/**
 * exporting functions.
 */
module.exports = {
    isEmpty: isEmpty,
    compare:compare,
    comparePost: comparePost,
    compareReply:compareReply
}
