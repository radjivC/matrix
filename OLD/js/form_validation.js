
//-------- Form validation -----------//
//<![CDATA[
    if (window.ClientSideValidations === undefined) window.ClientSideValidations = {};
    window.ClientSideValidations.disabled_validators = [];
    window.ClientSideValidations.number_format = {
        "separator": ".",
        "delimiter": ","
    };
    if (window.ClientSideValidations.patterns === undefined)
        window.ClientSideValidations.patterns = {};
        
    window.ClientSideValidations.patterns.numericality = /^(-|\+)?(?:\d+|\d{1,3}(?:\,\d{3})+)(?:\.\d*)?$/;
    
    if (window.ClientSideValidations.remote_validators_prefix === undefined) 
        window.ClientSideValidations.remote_validators_prefix = '';
        
    if (window.ClientSideValidations.forms === undefined) window.ClientSideValidations.forms = {};
        window.ClientSideValidations.forms['sign_up_user'] = {
        "type": "ActionView::Helpers::FormBuilder",
        "input_tag": "\u003Cspan class=\"field_with_errors\"\u003E\u003Cspan id=\"input_tag\" /\u003E\u003Clabel for=\"\" class=\"message\"\u003E\u003C/label\u003E\u003C/span\u003E",
        "label_tag": "\u003Cspan class=\"field_with_errors\"\u003E\u003Clabel id=\"label_tag\" /\u003E\u003C/span\u003E",
        "validators": {
            "data[User][email]": {
                "uniqueness": [{
                    "message": "ya ha sido registrado",
                    "case_sensitive": true,
                    "allow_blank": true
                }, {
                    "message": "ya ha sido registrado",
                    "case_sensitive": true
                }],
                "format": [{
                    "message": "es inv�lido",
                    "with": /^[^@]+@[^@]+$/,
                    "allow_blank": true
                }],
                "presence": [{
                    "message": "no se puede quedar en blanco"
                }]
            },
            "data[User][name]": {
                "presence": [{
                    "message": "no puede estar en blanco"
                }],
                "length": [{
                    "messages": {
                        "minimum": "es muy corto (m�nimo 3 car�cteres)"
                    },
                    "minimum": 3
                }]
            },
            "data[User][password]": {
                "presence": [{
                    "message": "no puede estar en blanco"
                }],
                "confirmation": [{
                    "message": "las contrase�as no coinciden"
                }],
                "length": [{
                    "messages": {
                        "minimum": "es nmuy corto (m�nimo son 6 caracteres)",
                        "maximum": "es muy largo (m�ximo son 20 caracteres)"
                    },
                    "allow_blank": true,
                    "minimum": 6,
                    "maximum": 20
                }]
            }
        }
    };
//]]>