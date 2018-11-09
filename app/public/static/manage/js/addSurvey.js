/**
 * Created by xiaohe on 16/5/17.
 */
var questionCount = 0;
function addQuestion(question_type){

    console.log(question_type);
    if(question_type == "填空题"){
        var newQuestion = $("#tiankong-temp").clone();
        newQuestion.removeClass("template");
        newQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        newQuestion.find(".editButton").attr("onclick","editTiankongQuestion(this)");
        newQuestion.find(".title").val("");
        newQuestion.attr("id",questionCount);
        newQuestion.data("type","填空题");
        $("#questionlist").append(newQuestion);
    }else if(question_type == "单选题"){
        var newQuestion = $("#danxuan-temp").clone();
        newQuestion.removeClass("template");
        newQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        newQuestion.find(".editButton").attr("onclick","editDanxuanQuestion(this)");
        newQuestion.attr("id",questionCount);
        newQuestion.data("type","单选题");
        var newOption = $("#danxuan-option-template").clone();
        newOption.removeClass("template");
        newQuestion.find(".options").append(newOption);

        $("#questionlist").append(newQuestion);

    }else if(question_type == "多选题"){
        var newQuestion = $("#duoxuan-temp").clone();
        newQuestion.removeClass("template");
        newQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        newQuestion.find(".editButton").attr("onclick","editDuoxuanQuestion(this)");
        newQuestion.attr("id",questionCount);
        newQuestion.data("type","多选题");
        var newOption = $("#duoxuan-option-template").clone();
        newOption.attr("id","");
        newOption.removeClass("template");
        newQuestion.find(".options").append(newOption);
        $("#questionlist").append(newQuestion);

    }else if(question_type == "滑动题"){ //滑动题
        var newQuestion = $("#huadong-temp").clone();
        newQuestion.removeClass("template");
        newQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        newQuestion.find(".editButton").attr("onclick","editHuadongQuestion(this)");
        newQuestion.attr("id",questionCount);
        newQuestion.data("type","滑动题");
        $("#questionlist").append(newQuestion);
    }
    else{ //点阵题
        var newQuestion = $("#dianzhen-temp").clone();
        newQuestion.removeClass("template");
        newQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        newQuestion.find(".editButton").attr("onclick","editDianZhenQuestion(this)");
        newQuestion.attr("id",questionCount);
        newQuestion.data("type","点阵题");
        $("#questionlist").append(newQuestion);
    }
    questionCount++;
}
function deleteQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    questionWrapper.remove();
    var count = 0;
    $("#questionlist").find(".question").each(function(){
        $(this).attr("id",count);
        $(this).find(".number").html(count+1+".");
        count++;
    })
    questionCount--;
}


function addOption(e){

    var newOption = $("#danxuan-option-template").clone();
    newOption.attr("id","");
    newOption.find(".optioninput").val("");
    newOption.attr("id","");
    newOption.removeClass("template")
    var optionswrapper = $(e).parent().parent().parent();
    optionswrapper.after(newOption);

}
function deleteOption(e){
    var optionswrapper = $(e).parent().parent().parent();
    optionswrapper.remove();
}
function editDanxuanQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    var id = questionWrapper.attr("id");
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    if(questionWrapper.hasClass("edited")){
        questionWrapper.removeClass("edited");
        var uneditedQuestion = $("#danxuan-temp").clone();
        uneditedQuestion.removeClass("template");
        uneditedQuestion.removeClass("question");
        uneditedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        uneditedQuestion.find(".editButton").attr("onclick","editDanxuanQuestion(this)");
        var title = questionWrapper.find('.title').html();
        uneditedQuestion.find(".title").val(title);
        questionWrapper.find(".radiolabel").each(function(){
            var newoption = $("#danxuan-option-template").clone();
            newoption.removeClass("template");
            newoption.attr("id","");
            newoption.find(".optioninput").val($(this).html().replace(/<input type="radio">/g,""))
            uneditedQuestion.find(".options").append(newoption);

        })
        questionWrapper.html(uneditedQuestion);
    }
    else{
        questionWrapper.addClass("edited");
        var editedQuestion = $("#danxuan-edited-temp").clone();
        var title = questionWrapper.find('.title').val();
        editedQuestion.removeClass("template");
        editedQuestion.attr("id","");
        editedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        editedQuestion.find(".editButton").attr("onclick","editDanxuanQuestion(this)");
        var checked = questionWrapper.find(".requiredCheck").get(0).checked;

        questionWrapper.find(".optioninput").each(function(){
            var newoption = $("#danxuan-radio-template-edited").clone();
            newoption.removeClass("template");
            newoption.attr("id","");
            newoption.find(".radiolabel").html("<input type='radio'>"+$(this).val());
            editedQuestion.find(".options").append(newoption);

        })
        id++;
        if(checked){
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span><span class='requiredflag'> * </span>";
        }else{
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span>";
        }

        editedQuestion.find('.editedtitle').html(newHtml);
        questionWrapper.html(editedQuestion);

        //questionList[id] = {"type":"填空题","title":title,"required":checked};
    }
}
function editTiankongQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    var id = questionWrapper.attr("id");
    if(questionWrapper.hasClass("edited")){
        questionWrapper.removeClass("edited");

        var uneditedQuestion = $("#tiankong-temp").clone();
        uneditedQuestion.removeClass("template");
        uneditedQuestion.removeClass("question");
        uneditedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        uneditedQuestion.find(".editButton").attr("onclick","editTiankongQuestion(this)");
        var title = questionWrapper.find('.title').html();
        uneditedQuestion.find(".title").val(title);
        questionWrapper.html(uneditedQuestion);

    }else{
        questionWrapper.addClass("edited");
        var editedQuestion = $("#tiankong-edited-temp").clone();
        var title =questionWrapper.find('.title').val();
        editedQuestion.removeClass("template");
        editedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        editedQuestion.find(".editButton").attr("onclick","editTiankongQuestion(this)");
        var checked = questionWrapper.find(".requiredCheck").get(0).checked;
        id++;
        if(checked){
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span><span class='requiredflag'> * </span>";
        }else{
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span>";
        }

        editedQuestion.find('.editedtitle').html(newHtml);
        questionWrapper.html(editedQuestion);

    }
}
function addDuoxuanOption(e){

    var newOption = $("#duoxuan-option-template").clone();
    newOption.attr("id","");
    newOption.find(".optioninput").val("");
    newOption.attr("id","");
    newOption.removeClass("template")
    var optionswrapper = $(e).parent().parent().parent();
    optionswrapper.after(newOption);

}
function deleteDuoxuanOption(e){
    var optionswrapper = $(e).parent().parent().parent();
    optionswrapper.remove();
}
function editDuoxuanQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    var id = questionWrapper.attr("id");
    if(questionWrapper.hasClass("edited")){
        questionWrapper.removeClass("edited");
        var uneditedQuestion = $("#duoxuan-temp").clone();
        uneditedQuestion.removeClass("template");
        uneditedQuestion.removeClass("question");
        uneditedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        uneditedQuestion.find(".editButton").attr("onclick","editDuoxuanQuestion(this)");
        var title = questionWrapper.find('.title').html();
        questionWrapper.find(".radiolabel").each(function(){
            var newoption = $("#danxuan-option-template").clone();
            newoption.removeClass("template");
            newoption.attr("id","");
            newoption.find(".optioninput").val($(this).html().replace(/<input type="checkbox">/g,""))
            uneditedQuestion.find(".options").append(newoption);

        })
        uneditedQuestion.find(".title").val(title);
        questionWrapper.html(uneditedQuestion);
    }
    else{
        questionWrapper.addClass("edited");
        var editedQuestion = $("#duoxuan-edited-temp").clone();
        var title = $("#"+id).find('.title').val();
        editedQuestion.removeClass("template");
        editedQuestion.attr("id","");
        editedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        editedQuestion.find(".editButton").attr("onclick","editDuoxuanQuestion(this)");
        var checked = $("#"+id).find(".requiredCheck").get(0).checked;

        $("#"+id).find(".optioninput").each(function(){
            var newoption = $("#duoxuan-radio-template-edited").clone();
            newoption.removeClass("template");
            newoption.attr("id","");
            newoption.find(".radiolabel").html("<input type='checkbox'>"+$(this).val());
            editedQuestion.find(".options").append(newoption);

        })
        id++;
        if(checked){
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span><span class='requiredflag'> * </span>";
        }else{
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span>";
        }

        editedQuestion.find('.editedtitle').html(newHtml);
        questionWrapper.html(editedQuestion);

        //questionList[id] = {"type":"填空题","title":title,"required":checked};
    }
}

function editHuadongQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    var id = questionWrapper.attr("id");
    if(questionWrapper.hasClass("edited")){
        questionWrapper.removeClass("edited");

        var uneditedQuestion = $("#huadong-temp").clone();
        uneditedQuestion.removeClass("template");
        uneditedQuestion.removeClass("question");
        uneditedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        uneditedQuestion.find(".editButton").attr("onclick","editHuadongQuestion(this)");
        var title = $("#"+id).find('.title').html();
        var left_axis = $("#"+id).find('.left-axis').html();
        var right_axis = $("#"+id).find('.right-axis').html();
        var range = $("#"+id).find('.range').html();
        uneditedQuestion.find(".title").val(title);
        uneditedQuestion.find(".left-axis").val(left_axis);
        uneditedQuestion.find(".right-axis").val(right_axis);
        uneditedQuestion.find(".range").val(range);
        questionWrapper.html(uneditedQuestion);
    }else{
        questionWrapper.addClass("edited");
        var editedQuestion = $("#huadong-temp-edited").clone();
        var title = $("#"+id).find('.title').val();
        editedQuestion.removeClass("template");
        editedQuestion.attr("id","");
        editedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        editedQuestion.find(".editButton").attr("onclick","editHuadongQuestion(this)");
        var checked = $("#"+id).find(".requiredCheck").get(0).checked;


        var left_axis = $("#"+id).find(".left-axis").val();
        var right_axis = $("#"+id).find(".right-axis").val();
        var range = $("#"+id).find('.range').val();

        id++;
        if(checked){
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span><span class='requiredflag'> * </span>";
        }else{
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span>";
        }
        editedQuestion.find(".left-axis").html(left_axis);
        editedQuestion.find(".right-axis").html(right_axis);
        editedQuestion.find(".range").html(range);
        editedQuestion.find('.editedtitle').html(newHtml);
        range = parseInt(range);
        if(range<=0){
            range = 100;
        }
        editedQuestion.find('.slider-input').jRange({
            from: 0,
            to: range,
            step: 1,
            scale: [0,range/4,range/2,range*3/4,range],
            format: '%s',
            width: 600,
            showLabels: true
        });
        questionWrapper.html(editedQuestion);

    }

}



function editDianZhenQuestion(e){
    var questionWrapper = $(e).parent().parent().parent().parent();
    if(!questionWrapper.hasClass("question")){
        questionWrapper = questionWrapper.parent();
    }
    var id = questionWrapper.attr("id");
    if(questionWrapper.hasClass("edited")){
        questionWrapper.removeClass("edited");
        var uneditedQuestion = $("#dianzhen-temp").clone();
        uneditedQuestion.removeClass("template");
        uneditedQuestion.removeClass("question");
        uneditedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        uneditedQuestion.find(".editButton").attr("onclick","editDianZhenQuestion(this)");
        var title = $("#"+id).find('.title').html();
        var left_axis = $("#"+id).find('.left-axis').html();
        var right_axis = $("#"+id).find('.right-axis').html();
        var range = $("#"+id).find('.range').html();
        uneditedQuestion.find(".title").val(title);
        uneditedQuestion.find(".left-axis").val(left_axis);
        uneditedQuestion.find(".right-axis").val(right_axis);
        uneditedQuestion.find(".range").val(range);
        questionWrapper.html(uneditedQuestion);
    }else{
        questionWrapper.addClass("edited");
        var editedQuestion = $("#dianzhen-temp-edited").clone();
        var title = $("#"+id).find('.title').val();
        editedQuestion.removeClass("template");
        editedQuestion.attr("id","");
        editedQuestion.find(".deleteButton").attr("onclick","deleteQuestion(this)");
        editedQuestion.find(".editButton").attr("onclick","editDianZhenQuestion(this)");
        var checked = $("#"+id).find(".requiredCheck").get(0).checked;


        var left_axis = $("#"+id).find(".left-axis").val();
        var right_axis = $("#"+id).find(".right-axis").val();
        var range = $("#"+id).find('.range').val();

        id++;
        if(checked){
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span><span class='requiredflag'> * </span>";
        }else{
            var newHtml = "<span class='number'>"+id+". </span><span class='title'>"+title+"</span>";
        }
        editedQuestion.find(".left-axis").html(left_axis);
        editedQuestion.find(".right-axis").html(right_axis);
        editedQuestion.find(".range").html(range);
        editedQuestion.find('.editedtitle').html(newHtml);
        range = parseInt(range);
        if(range<=0){
            range = 5;
        }
        for(i =0; i < range;i++){
            editedQuestion.find(".dianzhen-dian").append("<div style='width: "+600/range+"px;display:inline-block'><label class='radio-inline'> <input type='radio'>"+(i+1)+"</label></div>")
        }
        questionWrapper.html(editedQuestion);

    }

}
function publish(){
    questionList = {};
    for( i = 0;i<questionCount;i++){
        var currques = $("#"+i);
        var questionEle = {};
        if(!currques.hasClass("edited")){
            currques.find(".editButton").click();

        }

        questionEle["type"] = currques.data('type');
        questionEle["title"] = currques.find('.title').html();
        if(currques.find(".requiredflag").length == 1){
            questionEle["required"] = 1;
        }else{
            questionEle["required"] = 0;
        }
        if(questionEle["type"] == "单选题"){
            questionEle["type"]= 2;
            var options={};
            var count = 1;
            currques.find(".radiolabel").each(function(){

                options[count] = $(this).html().replace(/<input type="radio">/g,"");
                count++;
            })
            questionEle["options"] = options;
        }else if(questionEle['type'] == "多选题"){
            questionEle["type"]= 3;
            var options={};
            var count = 1;
            currques.find(".radiolabel").each(function(){

                options[count] = $(this).html().replace(/<input type="checkbox">/g,"");
                count++;
            })
            questionEle["options"] = options;
        }else if(questionEle['type'] == "滑动题"){
            questionEle["type"]= 4;
            questionEle["left_axis"] = currques.find('.left-axis').html();
            questionEle["right_axis"] = currques.find('.right-axis').html();
            questionEle["start"] = 0;
            questionEle["end"] = currques.find('.range').html();
            questionEle["range"] = currques.find('.range').html();
        }else if(questionEle['type'] == "点阵题"){
            questionEle["type"]= 5;
            questionEle["left_axis"] = currques.find('.left-axis').html();
            questionEle["right_axis"] = currques.find('.right-axis').html();
            questionEle["start"] = 1;
            questionEle["end"] = currques.find('.range').html();
            questionEle["range"] = currques.find('.range').html();
        }else{
            questionEle["type"]= 1;
        }

        questionList[i+1] = questionEle;
    }
    console.log(questionList);
    var surveytitle = $("#surveytitle").html();
    var surveyintro = $("#surveyintro").html();
    $.ajax({
        type: "post",
        dataType: "json",
        url: '/survey/createSurvey',
        data: {"quetionlist":JSON.stringify(questionList),"title":surveytitle,"introduction":surveyintro},
        success: function (data) {
            console.log(data);
            surveyid = data.survey;
            window.location.href = "/page/createSurveySuccess/"+surveyid;
        }
    });


}

//window.onbeforeunload = function (e) {
//    e = e || window.event;
//
//    // 兼容IE8和Firefox 4之前的版本
//    if (e) {
//        e.returnValue = '关闭提示';
//    }
//
//    // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
//    return '关闭提示';
//};

//自动变成完成状态？
//选择题不能全部删除？
//返回页面提示