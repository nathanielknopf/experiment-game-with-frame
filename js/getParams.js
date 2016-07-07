var getParam = function(param){
    var pageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = pageURL.split('&'),
        param_name

    for (var i = 0; i < URLVariables.length; i++){
        param_name = URLVariables[i].split('=')
        if(param_name[0] == param){
            return param_name[1] === undefined ? true : param_name[1]
        }
    }
}