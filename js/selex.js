//Selex super select//
/*
Author : Austin 
Copyright 2013
licensed under MIT
*/

(function ($) {
    var methods = {
        tim: null,
        defaults: {
            icon: "&#9660;",
            filter: false
        },
        html: '<div class="nSelect">\
                <div class="nContainer">\
                    <div class="nText"></div\
                    ><div class="nArrow"></div>\
                </div>\
                <div class="nActualInner"><ul class="selList"></ul>\
                </div>\
            </div>', //create the html for the select structure
        create: function (title, options, content) { //using call for the original object "this", append html
            $(this).html(content);
            $(this).find('.nArrow').html(options.icon);
            $(this).find('.nText').html(title);
            $(this).find('.nSelect').attr('id', options.id).data().options = options; //add the generated ID
             $(this).find('.nSelect').data().id = options.id;
            if(options.theme){
                 $(this).find('.nSelect').addClass(options.theme);
            }
            if(options.preicon){
                 $(this).find('.nText').prepend('<span class="nPreIcon">'+options.preicon+'</span>')
            }
            if (options.filter) {
                $(this).find('.nActualInner ul').append('<ul>\
                        <li class="selInput"><input type="text" class="selInput" value="Filter"></li>\
                    </ul>');
            }
        },
        giveItems: function (o,list) { //returns the proper html for the items given an object
            var html = "";
            for (var x in o) {
                if(list){
                    if(list[x]){
                        var sel = "nItemSelected"; //keeps track of matching selected item if multi is active. Will reselect incoming new items
                    }else{
                        var sel = "";
                    }
                }else{
                    var sel = "";
                }
                html += "<li><span class='selItem "+sel+"' value='"+x+"'>" + o[x] + "</span></li>";
            }
            return "<span class='selHolder'>" + html + "</span>";
        },
        bind: function (opts, methods) { //binds allt he handlers
            var ele = $('#' + opts.id);
            if (opts.multi) {
                ele.data().list = {};
            }
            var openThing = false;
            this.find('.nText,.nArrow').click(function () { //for the click fown
                var par = $(this).parents('.nSelect');
                par.find('.nActualInner').slideToggle(200);
                par.find('.nContainer').toggleClass('nContainerSel');
                openThing = true;
                par.find('.nArrow').toggleClass('nSelected');
            });
            $(document).unbind('click').click(function (e) { //for the doc click, filtering by children
                if ($(e.target).parents('.nSelect').length == 0) {
                    $('.nActualInner').stop().slideUp(200);
                    $('.nContainer').removeClass('nContainerSel');
                    $('.nArrow').removeClass('nSelected');
                }
            });
            this.find('.nActualInner').mouseleave(function () { //hover out
                $(this).stop().slideUp(200);
                $(this).parent().find('.nContainer').removeClass('nContainerSel');
                $(this).parent().find('.nArrow').removeClass('nSelected');
            })
                .delegate('.selItem','click', function () { //each item
                //console.log($(this).attr('value'));
                var dat = $(this).parents('.nSelect').data();
                var selected = $(this).hasClass('nItemSelected') ? true : false;
                console.log(dat);
                if(dat.list !== undefined){
                var multi = dat.list; //if multi is disabled, only returns a single item at a time, else an object of them
                }
                if (!selected) {
                   
                    if (dat.options.onFilter !== undefined) {
                        var inf = multi !== undefined ? multi : $(this);
                       
                    }
                    if (multi === undefined) {
                      
                        $(this).parents('.selHolder').find('.selItem').each(function(){
                            $(this).removeClass('nItemSelected');
                            console.log($(this).attr('value'));
                        });
                    }else{
                         multi[$(this).attr('value')] = $(this).html();
                    }
                     if (dat.options.onChange !== undefined) {
                     dat.options.onChange(inf, !selected, $(this).attr('value'));
                     }
                    $(this).addClass('nItemSelected');
                } else {
                   
                    if (multi === undefined) {
                        console.log($(this).parents('.selHolder').find('.nItemSelected'));
                         $(this).parent().find('.nItemSelected').removeClass('nItemSelected');
                        
                    } else {
                         delete(multi[$(this).attr('value')]);
                        $(this).removeClass('nItemSelected');
                    }
                    if (dat.options.onChange !== undefined) {
                        var inf = multi !== undefined ? multi : $(this);
                        dat.options.onChange(inf, !selected, $(this).attr('value'));
                    }
                }
            });
            this.find('.nActualInner').find('.selInput input').click(function () { //if filter, propagte the input
                var val = "Filter";
                if ($(this).val() == val) {
                    $(this).val('');
                }

            });

            if (opts.filter && opts.url) {
                this.find('.nActualInner').find('.selInput input').keyup(function () { //keydown and keyup post the filter and replace the html with incoming
                    var ndat = $(this).parents('.nSelect').data();
                    var self = $(this);
                    methods.tim = setTimeout(function () {
                        $.post(opts.url, {
                            "filter": self.val()
                        }, function (data) {
                            /*
                             needs to be:
                             {
                                "value" : "text",
                                "value" : "text",
                                ..etc 
                             }
                             ..formatted
                             
                            */
                            if (ndat.options.onFilter !== undefined) {
                                ndat.options.onFilter(self.val(), data);
                            }
                            if (data || data.options) {
                                var dat = data !== undefined ? data : data.options;
                                var nop = ndat;
                                nop.options.options = data;
                                $('#'+ndat.id).find('.selHolder').html(methods.giveItems(nop.options.options,ndat.list));
                            }
                            clearTimeout(methods.tim);
                        }, "json");
                        clearTimeout(methods.tim);
                    }, 400);
                }).keydown(function () {
                    clearTimeout(methods.tim);
                });
            }
        }

    };

    $.fn.selex = function (title, opts) { //inits it, and uses call for the current elements "this", also is chainable
        var id = "selex_" + Math.round(Math.random() * 3000);
        opts.id = id;
        methods.defaults = $.extend(methods.defaults, opts);
        methods.create.call(this, title, opts, methods.html);
        this.find('.selList').append(methods.giveItems(opts.options));
        this.data().tim = null;
        methods.bind.call(this, opts, methods);
        return this;
    }
}(jQuery));