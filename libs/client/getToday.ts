const getTodayDateTime = {

  getDate: () => { //날짜를 구해주는 함수
    let today = new Date();

    let year = String(today.getFullYear());
    let month = ('0' + (today.getMonth() + 1)).slice(-2);
    let day = ('0' + today.getDate()).slice(-2);
  
    // let dateString = year + '.' + month  + '.' + day;
    return {tyear: year, tmonth: month, tday: day};
  },

  getTime: () => { //시간을 구해주는 함수
    let today = new Date();   

    let hours = ('0' + today.getHours()).slice(-2); 
    let minutes = ('0' + today.getMinutes()).slice(-2);
    let seconds = ('0' + today.getSeconds()).slice(-2); 
    
    let timeString = hours + ':' + minutes  + ':' + seconds;
    return timeString
  }

}

export default getTodayDateTime;