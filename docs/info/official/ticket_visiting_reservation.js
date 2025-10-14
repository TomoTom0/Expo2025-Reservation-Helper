(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[5175], {
    19089: function(e, _, t) {
        (window.__NEXT_P = window.__NEXT_P || []).push(["/ticket_visiting_reservation", function() {
            return t(93178)
        }
        ])
    },
    43333: function(e, _, t) {
        "use strict";
        var n = t(85893)
          , i = t(86231)
          , s = t.n(i)
          , a = t(91784)
          , r = t(15273)
          , o = t(22146);
        _.Z = function(e) {
            var _ = e.isOpen
              , t = e.toggleIsOpen
              , i = function() {
                t()
            };
            return (0,
            n.jsx)(a.Z, {
                isOpen: _,
                toggle: function() {
                    return i()
                },
                customContent: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    width: "750px",
                    maxWidth: "calc(100vw - 60px)",
                    maxHeight: "90%",
                    transform: "translate(-50%, -50%)",
                    border: "solid 2px #000",
                    padding: "0"
                },
                altCloseMessageCode: "SW_GP_DL_019_0323",
                ariaLabelledby: "processing_alert_title",
                children: (0,
                n.jsxs)("div", {
                    className: s().main,
                    children: [(0,
                    n.jsx)("h2", {
                        className: s().main__title,
                        id: "processing_alert_title",
                        children: (0,
                        n.jsx)("div", {
                            className: s().title,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_019_0320"
                            })
                        })
                    }), (0,
                    n.jsx)("div", {
                        className: s().main__notes,
                        children: (0,
                        n.jsx)(r.Z, {
                            messageCode: "SW_GP_DL_019_0321"
                        })
                    }), (0,
                    n.jsx)("div", {
                        className: s().main__button,
                        children: (0,
                        n.jsx)("a", {
                            role: "button",
                            className: s().close_button,
                            onClick: i,
                            onKeyUp: function(e) {
                                return (0,
                                o.x)(e, i)
                            },
                            tabIndex: 0,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_019_0322"
                            })
                        })
                    })]
                })
            })
        }
    },
    87316: function(e, _, t) {
        "use strict";
        t.d(_, {
            Y: function() {
                return c
            }
        });
        var n = t(85893)
          , i = t(64800)
          , s = t.n(i)
          , a = t(91784)
          , r = t(15273)
          , o = t(22146)
          , l = {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            width: "400px",
            maxWidth: "calc(100vw - 60px)",
            maxHeight: "90%",
            transform: "translate(-50%, -50%)",
            border: "solid 2px #000",
            padding: "0"
        }
          , c = function(e) {
            var _, t = e.isOpen, i = e.toggleIsOpen, c = e.ticketId, d = e.type, u = e.validationError, m = [{
                text: c
            }];
            return (0,
            n.jsx)(a.Z, {
                isOpen: t,
                toggle: function() {
                    return i()
                },
                customContent: l,
                className: s().modal,
                ariaLabelledby: "agent_ticket_failed_alert_title",
                children: (0,
                n.jsxs)("div", {
                    className: s().modal,
                    children: [(0,
                    n.jsxs)("h2", {
                        className: s().modal__header,
                        id: "agent_ticket_failed_alert_title",
                        children: [(0,
                        n.jsx)("img", {
                            src: "/asset/img/ico_alert.svg",
                            alt: ""
                        }), (0,
                        n.jsx)("div", {
                            className: s().modal__head,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_163_0001"
                            })
                        })]
                    }), (0,
                    n.jsx)("div", {
                        className: s().modal__alert_messages,
                        children: "multiple" === d ? function() {
                            if (!u)
                                return null;
                            var e = [];
                            for (var _ in u.error.detail)
                                ["ticket_errors", "reserve_errors"].includes(_) || e.push({
                                    ticket_id: _,
                                    messageCodes: u.error.detail[_]
                                });
                            return e.map((function(e, _) {
                                return (0,
                                n.jsxs)("div", {
                                    children: [e.messageCodes.map((function(_) {
                                        return (0,
                                        n.jsx)("p", {
                                            className: s().modal__error,
                                            children: (0,
                                            n.jsx)(r.Z, {
                                                messageCode: _,
                                                variables: [{
                                                    text: e.ticket_id
                                                }]
                                            })
                                        }, _)
                                    }
                                    )), (0,
                                    n.jsx)("br", {})]
                                }, _)
                            }
                            ))
                        }() : (0,
                        n.jsx)(n.Fragment, {
                            children: null === (_ = e.messages) || void 0 === _ ? void 0 : _.map((function(e, _) {
                                return (0,
                                n.jsx)("p", {
                                    className: s().modal__error,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        messageCode: e,
                                        variables: m
                                    })
                                }, _)
                            }
                            ))
                        })
                    }), (0,
                    n.jsx)("div", {
                        children: (0,
                        n.jsx)("a", {
                            role: "button",
                            onClick: i,
                            onKeyUp: function(e) {
                                return (0,
                                o.x)(e, i)
                            },
                            className: "basic-btn type1 ".concat(s().modal__close_btn),
                            tabIndex: 0,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_163_0002"
                            })
                        })
                    })]
                })
            })
        }
    },
    83885: function(e, _, t) {
        "use strict";
        var n = t(85893)
          , i = (t(67294),
        t(57324))
          , s = t.n(i)
          , a = t(15273);
        _.Z = function(e) {
            var _;
            return (0,
            n.jsx)("li", {
                className: s().content,
                "data-item-type": e.type,
                "data-color-type": e.color,
                "data-emphasis-type": e.emphasis,
                "data-background-emphasis": e.background_emphasis,
                style: {
                    borderTop: e.border_top
                },
                children: (0,
                n.jsxs)("dl", {
                    children: [e.title_code && (0,
                    n.jsx)(a.Z, {
                        is: "dt",
                        messageCode: e.title_code,
                        symbolicDecoration: e.title_decoration
                    }), void 0 !== e.priority && (0,
                    n.jsx)(a.Z, {
                        is: "dt",
                        messageCode: null !== (_ = e.priority_message_id) && void 0 !== _ ? _ : "CMN_0012_0080",
                        variables: [{
                            text: "".concat(e.priority)
                        }],
                        symbolicDecoration: e.priority_decoration
                    }), e.entrance_date && (0,
                    n.jsx)("dd", {
                        "data-desc": "date",
                        children: e.entrance_date
                    }), (0,
                    n.jsx)("dd", {
                        "data-desc": "time",
                        children: (0,
                        n.jsx)("span", {
                            children: e.schedule_name
                        })
                    }), (0,
                    n.jsx)("dd", {
                        "data-desc": "event",
                        children: e.event_name
                    })]
                })
            })
        }
    },
    77851: function(e, _, t) {
        "use strict";
        var n = t(85893)
          , i = (t(67294),
        t(95088))
          , s = t.n(i);
        _.Z = function(e) {
            return (0,
            n.jsx)("ol", {
                className: s().content,
                style: {
                    maxWidth: e.maxWidth,
                    marginTop: e.mt
                },
                "data-shape-type": e.shape,
                children: e.children
            })
        }
    },
    62110: function(e, _, t) {
        "use strict";
        t.d(_, {
            r: function() {
                return r
            }
        });
        var n = t(85893)
          , i = t(39584)
          , s = t.n(i)
          , a = t(15273)
          , r = function() {
            return (0,
            n.jsxs)("div", {
                className: s().main,
                children: [(0,
                n.jsx)("h1", {
                    className: s().main__title,
                    children: (0,
                    n.jsx)(a.Z, {
                        messageCode: "SW_GP_DL_012_0117"
                    })
                }), (0,
                n.jsx)(a.Z, {
                    is: "p",
                    className: s().main__description,
                    messageCode: "SW_GP_DL_012_0118"
                })]
            })
        }
    },
    25918: function(e, _, t) {
        "use strict";
        t.d(_, {
            P: function() {
                return l
            }
        });
        var n = t(85893)
          , i = t(67294)
          , s = (t(9473),
        t(20114))
          , a = t.n(s)
          , r = t(15273)
          , o = (t(77186),
        function(e) {
            return i.createElement(e.level ? "h".concat(e.level) : "div", {
                className: e.className
            }, e.children)
        }
        )
          , l = function(e) {
            return (0,
            n.jsxs)("div", {
                className: a().main,
                children: [(0,
                n.jsx)(o, {
                    className: a().main__h1,
                    level: e.heading,
                    children: (0,
                    n.jsx)(r.Z, {
                        messageCode: "SW_GP_DL_019_0801"
                    })
                }), (0,
                n.jsxs)("dl", {
                    className: a().main__column,
                    children: [(0,
                    n.jsxs)("div", {
                        children: [(0,
                        n.jsx)("dt", {
                            className: a().main__h2,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_019_0802",
                                symbolicDecoration: "brackets"
                            })
                        }), (0,
                        n.jsxs)("dd", {
                            children: [(0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0803",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0804"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0805"
                                    })]
                                })]
                            }), (0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0806",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0807"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0808"
                                    })]
                                })]
                            }), (0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0809",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0810"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0811"
                                    })]
                                })]
                            })]
                        })]
                    }), (0,
                    n.jsxs)("div", {
                        children: [(0,
                        n.jsx)("dt", {
                            className: a().main__h2,
                            children: (0,
                            n.jsx)(r.Z, {
                                messageCode: "SW_GP_DL_019_0812",
                                symbolicDecoration: "brackets"
                            })
                        }), (0,
                        n.jsxs)("dd", {
                            children: [(0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0813",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0814"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0815"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0816"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0817"
                                    })]
                                })]
                            }), (0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0818",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0819"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0820"
                                    })]
                                })]
                            }), (0,
                            n.jsxs)("dl", {
                                className: a().main__section,
                                children: [(0,
                                n.jsx)("dt", {
                                    className: a().main__h3,
                                    children: (0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0821",
                                        symbolicDecoration: "square"
                                    })
                                }), (0,
                                n.jsxs)("dd", {
                                    children: [(0,
                                    n.jsx)(r.Z, {
                                        is: "div",
                                        messageCode: "SW_GP_DL_019_0822"
                                    }), (0,
                                    n.jsx)(r.Z, {
                                        messageCode: "SW_GP_DL_019_0823"
                                    })]
                                })]
                            })]
                        })]
                    })]
                })]
            })
        }
    },
    9563: function(e, _, t) {
        "use strict";
        t.d(_, {
            j: function() {
                return n
            }
        });
        var n = {
            FAST_LOTTERY: 1,
            MONTH_LOTTERY: 2,
            DAY_LOTTERY: 3,
            EMPTY_FRAME: 4,
            ON_THE_DAY: 5
        }
    },
    93178: function(e, _, t) {
        "use strict";
        t.r(_),
        t.d(_, {
            default: function() {
                return oe
            }
        });
        var n, i, s, a = t(47568), r = t(14924), o = t(82670), l = t(10253), c = t(34051), d = t.n(c), u = t(85893), m = t(9669), x = t(11163), y = t(67294), h = t(9473), b = t(19062), v = t.n(b), g = t(9691), p = t(64405), f = t(15273), k = t(43333), j = t(84770), S = t.n(j), D = t(91784), L = t(56739), P = t(62110), G = t(25918), N = t(22146), W = function(e) {
            var _ = (0,
            x.useRouter)()
              , t = e.isOpen
              , n = e.toggleIsOpen
              , i = e.href
              , s = (0,
            y.useContext)(L.T)
              , a = function() {
                i ? _.push(i) : n()
            };
            return (0,
            u.jsx)(D.Z, {
                isOpen: t,
                toggle: function() {
                    return a()
                },
                customContent: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    width: "825px",
                    maxWidth: "calc(100vw - 60px)",
                    height: "auto",
                    maxHeight: "calc(100vh - 60px)",
                    transform: "translate(-50%, -50%)",
                    border: "solid 2px #000",
                    padding: "0"
                },
                className: S()["buy-modal"],
                ariaLabelledby: "reservation_modal_title",
                children: (0,
                u.jsxs)("div", {
                    className: S().buy,
                    children: [(0,
                    u.jsx)("h2", {
                        className: "title",
                        id: "reservation_modal_title",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0302"
                        })
                    }), (0,
                    u.jsx)("img", {
                        src: "/asset/img/ico_reservation.svg",
                        alt: "",
                        className: S().calendar_icon,
                        "aria-labelledby": "reservation_modal_title"
                    }), (0,
                    u.jsxs)("div", {
                        className: "sum",
                        children: [(0,
                        u.jsxs)("p", {
                            children: [(0,
                            u.jsx)("span", {
                                className: S().sub_text,
                                children: e.date
                            }), (0,
                            u.jsx)("br", {}), (0,
                            u.jsx)("span", {
                                className: S().sub_text,
                                "data-symbolic-decoration": "lenticular",
                                children: e.gate
                            })]
                        }), (0,
                        u.jsx)("div", {
                            className: S().visit_message,
                            children: (0,
                            u.jsx)(G.P, {})
                        }), (0,
                        u.jsx)(P.r, {})]
                    }), (0,
                    u.jsx)("ul", {
                        className: "buttons",
                        children: (0,
                        u.jsx)("li", {
                            children: (0,
                            u.jsx)("a", {
                                className: "basic-btn type3 modal-close ".concat(S().close_btn),
                                onClick: function() {
                                    return a()
                                },
                                onKeyUp: function(e) {
                                    return (0,
                                    N.x)(e, a)
                                },
                                tabIndex: s.focusability.main ? 0 : -1,
                                children: (0,
                                u.jsx)("span", {
                                    className: "btn-text",
                                    children: (0,
                                    u.jsx)(f.Z, {
                                        messageCode: "SW_GP_DL_101_0140"
                                    })
                                })
                            })
                        })
                    })]
                })
            })
        }, E = t(84360), Z = t.n(E), C = function(e) {
            var _ = e.isOpen
              , t = e.toggleIsOpen
              , n = e.messageIds
              , i = (0,
            y.useContext)(L.T)
              , s = function() {
                t()
            };
            return (0,
            u.jsx)(D.Z, {
                isOpen: _,
                toggle: function() {
                    return s()
                },
                customContent: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    width: "750px",
                    maxWidth: "calc(100vw - 60px)",
                    height: "88vh",
                    maxHeight: "420px",
                    transform: "translate(-50%, -50%)",
                    border: "solid 2px #000",
                    padding: "0"
                },
                className: Z()["buy-modal"],
                ariaLabelledby: "reservation_fail_modal_title",
                children: (0,
                u.jsxs)("div", {
                    className: Z().buy,
                    children: [(0,
                    u.jsx)("h2", {
                        className: "title",
                        id: "reservation_fail_modal_title",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: n.title
                        })
                    }), (0,
                    u.jsx)("img", {
                        src: "/asset/img/ico_reservation.svg",
                        alt: "",
                        className: Z().calendar_icon
                    }), (0,
                    u.jsx)("div", {
                        className: "sum",
                        children: (0,
                        u.jsx)("p", {
                            children: (0,
                            u.jsx)("span", {
                                children: (0,
                                u.jsx)(f.Z, {
                                    messageCode: n.description
                                })
                            })
                        })
                    }), (0,
                    u.jsx)("ul", {
                        className: "buttons",
                        children: (0,
                        u.jsx)("li", {
                            children: (0,
                            u.jsx)("a", {
                                className: "basic-btn type3 modal-close",
                                onClick: s,
                                onKeyUp: function(e) {
                                    return (0,
                                    N.x)(e, s)
                                },
                                tabIndex: i.focusability.main ? 0 : -1,
                                children: (0,
                                u.jsx)("span", {
                                    className: "btn-text",
                                    children: (0,
                                    u.jsx)(f.Z, {
                                        messageCode: n.close
                                    })
                                })
                            })
                        })
                    })]
                })
            })
        }, w = t(63014), T = t.n(w), O = t(77186), Y = function(e) {
            var _ = e.href
              , t = e.isOpen
              , n = e.toggleIsOpen
              , i = (0,
            x.useRouter)()
              , s = (0,
            h.v9)((function(e) {
                return e.messages
            }
            ))
              , a = function() {
                _ ? i.push(_) : n()
            };
            return (0,
            u.jsx)(D.Z, {
                isOpen: t,
                toggle: a,
                customContent: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    width: "750px",
                    maxWidth: "calc(100vw - 60px)",
                    height: "70vh",
                    maxHeight: "400px",
                    transform: "translate(-50%, -50%)",
                    border: "solid 2px #000",
                    padding: "0"
                },
                ariaLabelledby: "reserve_change_processing_title",
                children: (0,
                u.jsxs)("div", {
                    className: T().main,
                    children: [(0,
                    u.jsxs)("h2", {
                        className: T().main__title,
                        id: "reserve_change_processing_title",
                        children: [(0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0501",
                            symbolicDecoration: "brackets"
                        }), (0,
                        u.jsx)("br", {}), (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0502"
                        })]
                    }), (0,
                    u.jsx)("img", {
                        className: T().main__icon,
                        src: "/asset/img/ico_reservation.svg",
                        alt: (0,
                        O.G)(s, "SW_GP_DL_117_0503")
                    }), (0,
                    u.jsx)("div", {
                        className: T().main__button,
                        children: (0,
                        u.jsx)("a", {
                            role: "button",
                            className: T().close_button,
                            onClick: a,
                            onKeyUp: function(e) {
                                return (0,
                                N.x)(e, a)
                            },
                            tabIndex: 0,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0504"
                            })
                        })
                    })]
                })
            })
        }, A = t(14449), I = t.n(A), R = t(83885), q = t(77851), F = t(9563), M = t(42719), U = t(61223), B = t(77714), V = t(93074);
        !function(e) {
            e[e.date = 0] = "date",
            e[e.timeOrGate = 1] = "timeOrGate"
        }(n || (n = {})),
        function(e) {
            e.east = "1",
            e.west = "2"
        }(i || (i = {})),
        function(e) {
            e.old = "old",
            e.new = "new"
        }(s || (s = {}));
        var K, Q, X = function(e) {
            var _ = (0,
            h.v9)((function(e) {
                return e.messages
            }
            ))
              , t = function(e) {
                var t = (0,
                B.o)((0,
                O.G)(_, e)).trim();
                return [":", "\uff1a"].includes(t[t.length - 1]) ? t.slice(0, -1) : t
            }
              , a = e.changeReserve
              , r = e.dayLotteries
              , o = e.isOpen
              , l = e.monthLotteries
              , c = e.newEntranceDate
              , d = e.newGateType
              , m = e.newScheduleName
              , x = e.onTheDayCalendar
              , y = e.selectTime
              , b = e.ticket
              , v = e.toggleIsOpen
              , g = function() {
                v()
            }
              , p = function(e) {
                switch (e) {
                case i.east:
                    return "SW_GP_DL_117_0417";
                case i.west:
                    return "SW_GP_DL_117_0418";
                default:
                    return ""
                }
            }
              , k = ""
              , j = ""
              , S = ""
              , L = !1
              , P = !1;
            b && b.schedules && (k = b.schedules[0].entrance_date,
            j = b.schedules[0].schedule_name,
            S = String(b.schedules[0].gate_type),
            L = b.schedules[0].lotteries.month.some((function(e) {
                return 1 === e.state
            }
            )),
            P = b.schedules[0].lotteries.day.some((function(e) {
                return 1 === e.state
            }
            )));
            var G = k !== c ? n.date : n.timeOrGate
              , W = x && (0,
            V.L3)(x) === V.WN.requesting
              , E = l && l.length > 0 && !L
              , Z = r && r.length > 0 && !P;
            return (0,
            u.jsx)(D.Z, {
                isOpen: o,
                toggle: function() {
                    return g()
                },
                customContent: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    marginRight: "-50%",
                    width: "750px",
                    maxWidth: "calc(100vw - 60px)",
                    height: "80vh",
                    maxHeight: "690px",
                    transform: "translate(-50%, -50%)",
                    border: "solid 2px #000",
                    padding: "0"
                },
                ariaLabelledby: "reserve_confirm_title",
                children: (0,
                u.jsxs)("div", {
                    className: I().main,
                    children: [(0,
                    u.jsx)("h2", {
                        className: I().main__title,
                        id: "reserve_confirm_title",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_101_0401"
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__confirm,
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_101_0402"
                        })
                    }), W && (0,
                    u.jsx)("div", {
                        className: I().main__on_the_day_alert,
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0426"
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__head,
                        "head-color": "old",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_101_0403",
                            symbolicDecoration: "brackets"
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__visit_date,
                        "visit-date-color": "old",
                        children: (0,
                        u.jsx)("dl", {
                            children: (0,
                            u.jsxs)("div", {
                                children: [(0,
                                u.jsx)("dt", {
                                    children: t("SW_GP_DL_101_0404")
                                }), (0,
                                u.jsxs)("dd", {
                                    children: ["".concat((0,
                                    M.xS)({
                                        day: !0,
                                        time: !1
                                    }).local(U.d4.local(k)), " ").concat(j), (0,
                                    u.jsx)("br", {}), (0,
                                    u.jsx)(f.Z, {
                                        messageCode: p(S),
                                        symbolicDecoration: "lenticular"
                                    })]
                                })]
                            })
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__sub_head,
                        "sub-head-color": "old",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0405"
                        })
                    }), b && b.event_schedules ? (0,
                    u.jsx)(J, {
                        ticket: b,
                        tableType: s.old
                    }) : (0,
                    u.jsx)("div", {
                        className: I().main__none,
                        "none-color": "old",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0410"
                        })
                    }), E && (0,
                    u.jsxs)(u.Fragment, {
                        children: [(0,
                        u.jsx)("div", {
                            className: I().main__sub_head,
                            "sub-head-color": "old",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0406"
                            })
                        }), (0,
                        u.jsx)(z, {
                            lotteries: l,
                            tableType: s.old,
                            keyPrefix: "month_old_"
                        })]
                    }), Z && (0,
                    u.jsxs)(u.Fragment, {
                        children: [(0,
                        u.jsx)("div", {
                            className: I().main__sub_head,
                            "sub-head-color": "old",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0416"
                            })
                        }), (0,
                        u.jsx)(z, {
                            lotteries: r,
                            tableType: s.old,
                            keyPrefix: "day_old_"
                        })]
                    }), (0,
                    u.jsx)("img", {
                        className: I().main__img,
                        src: "/asset/img/ico_triangle.svg",
                        alt: ""
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__head,
                        "head-color": "new",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0407",
                            symbolicDecoration: "brackets"
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__visit_date,
                        "visit-date-color": "new",
                        children: (0,
                        u.jsx)("dl", {
                            children: (0,
                            u.jsxs)("div", {
                                children: [(0,
                                u.jsx)("dt", {
                                    children: t("SW_GP_DL_117_0408")
                                }), (0,
                                u.jsxs)("dd", {
                                    children: ["".concat((0,
                                    M.xS)({
                                        day: !0,
                                        time: !1
                                    }).local(U.d4.local(c)), " ").concat(m), (0,
                                    u.jsx)("br", {}), (0,
                                    u.jsx)(f.Z, {
                                        messageCode: p(d),
                                        symbolicDecoration: "lenticular"
                                    })]
                                })]
                            })
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__sub_head,
                        "sub-head-color": "new",
                        children: (0,
                        u.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_117_0409"
                        })
                    }), G === n.date && (0,
                    u.jsxs)(u.Fragment, {
                        children: [(0,
                        u.jsx)("div", {
                            className: I().main__none,
                            "none-color": "new",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0410"
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: I().main__sub_head,
                            "sub-head-color": "new",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0411"
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: I().main__none,
                            "none-color": "new",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0410"
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: I().main__info,
                            "none-color": "new",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0412"
                            })
                        })]
                    }), G === n.timeOrGate && (0,
                    u.jsxs)(u.Fragment, {
                        children: [b && b.event_schedules ? (0,
                        u.jsx)(J, {
                            selectTime: y,
                            ticket: b,
                            tableType: s.new
                        }) : (0,
                        u.jsx)("div", {
                            className: I().main__none,
                            "none-color": "new",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0410"
                            })
                        }), E && (0,
                        u.jsxs)(u.Fragment, {
                            children: [(0,
                            u.jsx)("div", {
                                className: I().main__sub_head,
                                "sub-head-color": "new",
                                children: (0,
                                u.jsx)(f.Z, {
                                    messageCode: "SW_GP_DL_117_0406"
                                })
                            }), (0,
                            u.jsx)(z, {
                                lotteries: l,
                                tableType: s.new,
                                keyPrefix: "month_new_"
                            })]
                        }), Z && (0,
                        u.jsxs)(u.Fragment, {
                            children: [(0,
                            u.jsx)("div", {
                                className: I().main__sub_head,
                                "sub-head-color": "new",
                                children: (0,
                                u.jsx)(f.Z, {
                                    messageCode: "SW_GP_DL_117_0416"
                                })
                            }), (0,
                            u.jsx)(z, {
                                lotteries: r,
                                tableType: s.new,
                                keyPrefix: "day_new_"
                            })]
                        }), (0,
                        u.jsx)("div", {
                            className: I().main__info,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0415"
                            })
                        })]
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__button,
                        children: (0,
                        u.jsx)("button", {
                            className: I().next_button,
                            onClick: a,
                            onKeyUp: function(e) {
                                return (0,
                                N.x)(e, a)
                            },
                            tabIndex: 0,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0413"
                            })
                        })
                    }), (0,
                    u.jsx)("div", {
                        className: I().main__button,
                        children: (0,
                        u.jsx)("a", {
                            role: "button",
                            className: I().close_button,
                            onClick: g,
                            onKeyUp: function(e) {
                                return (0,
                                N.x)(e, g)
                            },
                            tabIndex: 0,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0414"
                            })
                        })
                    })]
                })
            })
        }, J = function(e) {
            var _ = e.selectTime
              , t = e.tableType
              , n = e.ticket
              , i = function(e) {
                switch (e) {
                case F.j.FAST_LOTTERY:
                    return "SW_GP_DL_117_0419";
                case F.j.MONTH_LOTTERY:
                    return "SW_GP_DL_117_0420";
                case F.j.DAY_LOTTERY:
                    return "SW_GP_DL_117_0421";
                case F.j.EMPTY_FRAME:
                    return "SW_GP_DL_117_0422";
                case F.j.ON_THE_DAY:
                    return "SW_GP_DL_117_0423";
                default:
                    return ""
                }
            };
            return (0,
            u.jsx)(q.Z, {
                children: n.event_schedules.map((function(e, n) {
                    return (0,
                    u.jsx)(R.Z, {
                        type: "lottery_confirm",
                        color: "old" === t ? "gray" : "red",
                        title_code: i(e.registered_channel),
                        title_decoration: "lenticular",
                        schedule_name: e.schedule_name,
                        event_name: e.event_name,
                        border_top: n ? void 0 : "none",
                        background_emphasis: _ && H(U.NT.fourDigits.toTime(e.start_time), _) ? "red" : void 0
                    }, n)
                }
                ))
            })
        }, z = function(e) {
            var _ = e.lotteries
              , t = e.selectTime
              , n = e.tableType;
            e.keyPrefix;
            return (0,
            u.jsx)(q.Z, {
                children: null === _ || void 0 === _ ? void 0 : _.map((function(e, _) {
                    return (0,
                    u.jsx)(R.Z, {
                        type: "lottery_confirm",
                        color: "old" === n ? "gray" : "red",
                        priority: _ + 1,
                        priority_message_id: "SW_GP_DL_117_0424",
                        priority_decoration: "brackets",
                        border_top: _ ? void 0 : "none",
                        schedule_name: null === e || void 0 === e ? void 0 : e.schedule_name,
                        event_name: e.event_name,
                        background_emphasis: t && H(U.NT.fourDigits.toTime(e.start_time), t) ? "red" : void 0
                    }, _)
                }
                ))
            })
        }, H = function(e, _) {
            if (!_)
                return !1;
            var t = e.split(":");
            return 60 * Number(t[0]) + Number(t[1]) < 60 * Number(_.slice(0, 2)) + Number(_.slice(2, 4))
        }, $ = t(915), ee = t(87316), _e = t(67201), te = t(8802), ne = t(36355), ie = t(82889), se = t(99043), ae = t(26111), re = t(83454);
        !function(e) {
            e.toTicketDetail = "019",
            e.toTicketSelect = "108"
        }(K || (K = {})),
        function(e) {
            e[e.failedReservation = 0] = "failedReservation",
            e[e.failedUpdate = 1] = "failedUpdate"
        }(Q || (Q = {}));
        var oe = function() {
            var e, _ = (0,
            x.useRouter)(), t = (0,
            ae.$M)(_), n = (0,
            y.useContext)(g.T).apiClient, i = _.query.screen_id, s = "string" === typeof i ? i.split(",") : [], c = (0,
            y.useState)(!1), b = c[0], j = c[1], S = (0,
            y.useState)(!1), D = S[0], L = S[1], P = (0,
            y.useState)(!1), G = P[0], N = P[1], E = (0,
            y.useState)(!1), Z = E[0], w = E[1], T = (0,
            y.useState)(!1), A = T[0], I = T[1], R = (0,
            y.useState)(null), q = R[0], F = R[1], J = (0,
            y.useState)(null), z = J[0], H = J[1], oe = (0,
            y.useState)(null), le = oe[0], ce = oe[1], de = (0,
            y.useState)(null), ue = de[0], me = de[1], xe = (0,
            y.useState)(), ye = xe[0], he = xe[1], be = (0,
            y.useState)(""), ve = be[0], ge = be[1], pe = (0,
            y.useState)(""), fe = pe[0], ke = pe[1], je = (0,
            y.useState)(""), Se = je[0], De = je[1], Le = (0,
            y.useState)(""), Pe = Le[0], Ge = Le[1], Ne = (0,
            y.useState)([]), We = Ne[0], Ee = Ne[1], Ze = (0,
            y.useState)(K.toTicketDetail), Ce = (Ze[0],
            Ze[1]), we = (0,
            y.useState)(!1), Te = we[0], Oe = we[1], Ye = (0,
            y.useState)(!1), Ae = Ye[0], Ie = Ye[1], Re = (0,
            y.useState)(null === (e = _.query) || void 0 === e ? void 0 : e.reserve_id), qe = Re[0], Fe = Re[1], Me = (0,
            y.useState)(!1), Ue = Me[0], Be = Me[1], Ve = (0,
            y.useState)(!1), Ke = Ve[0], Qe = Ve[1], Xe = (0,
            y.useState)(), Je = Xe[0], ze = Xe[1], He = (0,
            y.useState)(), $e = He[0], e_ = He[1], __ = (0,
            y.useState)(), t_ = __[0], n_ = __[1], i_ = (0,
            y.useState)(), s_ = i_[0], a_ = i_[1], r_ = (0,
            y.useState)(!1), o_ = r_[0], l_ = r_[1], c_ = (0,
            h.v9)((function(e) {
                return e.messages
            }
            )), d_ = (0,
            y.useState)(Q.failedReservation), u_ = d_[0], m_ = d_[1], x_ = function() {
                _.push((0,
                ae.A0)(_.asPath, "/"))
            }, y_ = function(e) {
                ke(e.time),
                Ge(e.type),
                De(e.display)
            }, h_ = function() {
                var e = (0,
                a.Z)(d().mark((function e() {
                    var _;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                I(!0),
                                _ = {
                                    ticket_ids: We,
                                    start_time: ("0" + fe.replace(":", "")).slice(-4),
                                    gate_type: Pe,
                                    entrance_date: ve.replace(/-/g, "")
                                },
                                n.default().post("/api/d/user_visiting_reservations", _).then((function(e) {
                                    var _, t = null === (_ = e.data.user_visiting_reservation_ids) || void 0 === _ ? void 0 : _[0];
                                    if (!t)
                                        throw (0,
                                        ie.dw)("invalid response data format");
                                    Fe(t),
                                    L(!0),
                                    I(!1)
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var _, n = (0,
                                        ie.Yi)(e), i = n.generalError;
                                        n.validationErrors;
                                        switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                        case 422:
                                            var s = e.response.data;
                                            if (s.error && "stock_not_available" === s.error.name) {
                                                m_(Q.failedReservation),
                                                w(!0);
                                                break
                                            }
                                            if (s.error && "reservation_already_used" === s.error.name) {
                                                m_(Q.failedUpdate),
                                                w(!0);
                                                break
                                            }
                                            if (s && s.error && s.error.detail && s.error.detail.errors) {
                                                Qe(!0),
                                                ze(s);
                                                break
                                            }
                                            if ("th_error" === (null === i || void 0 === i ? void 0 : i.name)) {
                                                t.notifySystemError("E_SW_GP_DL_117_9_422_6", null === i || void 0 === i ? void 0 : i.detail.th_error_code);
                                                break
                                            }
                                            w(!0);
                                            break;
                                        default:
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_1")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_1");
                                    I(!1)
                                }
                                ));
                            case 3:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function() {
                    return e.apply(this, arguments)
                }
            }(), b_ = function() {
                var e = (0,
                a.Z)(d().mark((function e() {
                    var _, i, s, a, r, l, c, u, x;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                if (i = Date.now(),
                                !(null === (s = re.env.NEXT_PUBLIC_CURRENT_TIME) || void 0 === s ? void 0 : s.match(/^\d{8,}$/))) {
                                    e.next = 6;
                                    break
                                }
                                return a = new Date(Number(s.slice(0, 4)),Number(s.slice(4, 6)) - 1,Number(s.slice(6, 8)),Number(s.slice(8, 10)),Number(s.slice(10, 12))).getTime() - i,
                                e.abrupt("return", Date.now() + a);
                            case 6:
                                return e.next = 8,
                                n.default().get("/api/d/current_time").catch((function(e) {
                                    (0,
                                    o.Z)(e, m.AxiosError) ? t.notifySystemError("E_SW_GP_DL_019_9_900_1") : t.notifySystemError("E_SW_GP_DL_019_9_999_1")
                                }
                                ));
                            case 8:
                                if (r = e.sent) {
                                    e.next = 11;
                                    break
                                }
                                return e.abrupt("return", -1);
                            case 11:
                                return c = null !== (l = null === (_ = r.data) || void 0 === _ ? void 0 : _.current_time) && void 0 !== l ? l : "",
                                u = c.replace(/^(\d{4}\-\d{2}\-\d{2}) (\d{2}\:\d{2}\:\d{2}) (\+\d{4})$/, (function() {
                                    for (var e = arguments.length, _ = new Array(e), t = 0; t < e; t++)
                                        _[t] = arguments[t];
                                    return "".concat(_[1], "T").concat(_[2]).concat(_[3])
                                }
                                )),
                                x = new Date(u || null).getTime() - i,
                                e.abrupt("return", Date.now() + x);
                            case 16:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function() {
                    return e.apply(this, arguments)
                }
            }(), v_ = function() {
                var e = (0,
                a.Z)(d().mark((function e() {
                    var i, s, a, r, l, c, u, x;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return j(!1),
                                I(!0),
                                e.next = 4,
                                b_();
                            case 4:
                                return i = e.sent,
                                s = _.query.id,
                                e.next = 8,
                                p_(s);
                            case 8:
                                if (a = e.sent) {
                                    e.next = 11;
                                    break
                                }
                                return e.abrupt("return");
                            case 11:
                                return r = a.schedules[0].entrance_date,
                                e.next = 14,
                                f_(r);
                            case 14:
                                return l = e.sent,
                                e.next = 17,
                                k_(s, r);
                            case 17:
                                return c = e.sent,
                                e.next = 20,
                                j_(s, r);
                            case 20:
                                if (u = e.sent,
                                !(0,
                                V.g_)(a.schedules[0], i, l, c.list, u.list)) {
                                    e.next = 25;
                                    break
                                }
                                return Be(!0),
                                I(!1),
                                e.abrupt("return");
                            case 25:
                                x = {
                                    user_visiting_reservation_ids: [q.schedules[0].user_visiting_reservation_id],
                                    start_time: ("0" + fe.replace(":", "")).slice(-4),
                                    gate_type: Pe,
                                    entrance_date: ve.replace(/-/g, "")
                                },
                                n.default().put("/api/d/user_visiting_reservations", x).then((function(e) {
                                    e.data.doing ? N(!0) : L(!0),
                                    I(!1)
                                }
                                )).catch((function(e) {
                                    if (e && e.response) {
                                        var _ = e.response.data;
                                        if (_.error && "stock_not_available" === _.error.name)
                                            return m_(Q.failedReservation),
                                            w(!0),
                                            void I(!1);
                                        if (_.error && "reservation_already_used" === _.error.name)
                                            return m_(Q.failedUpdate),
                                            w(!0),
                                            void I(!1);
                                        if (_ && _.error && _.error.detail && _.error.detail.errors)
                                            return Qe(!0),
                                            ze(_),
                                            void I(!1)
                                    }
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var n, i, s = (0,
                                        ie.Yi)(e), a = s.generalError;
                                        s.validationErrors;
                                        if (422 === (null === (n = e.response) || void 0 === n ? void 0 : n.status))
                                            "th_error" === (null === a || void 0 === a ? void 0 : a.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_62", null === a || void 0 === a || null === (i = a.detail) || void 0 === i ? void 0 : i.th_error_code) : w(!0);
                                        else
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_12")
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_12");
                                    I(!1)
                                }
                                ));
                            case 27:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function() {
                    return e.apply(this, arguments)
                }
            }(), g_ = function() {
                var e = (0,
                a.Z)(d().mark((function e(t) {
                    var n, i, s, a, r, o, l, c, u;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                p_(t);
                            case 2:
                                if (n = e.sent) {
                                    e.next = 5;
                                    break
                                }
                                return e.abrupt("return");
                            case 5:
                                if (F(n),
                                i = n.schedules[0].entrance_date,
                                _.query.type && "change" === _.query.type && (s = (0,
                                U.J9)(new Date((0,
                                U.$0)())),
                                a = U.d4.local(i),
                                n_(s > (null !== a && void 0 !== a ? a : 0) ? {
                                    year: s.getFullYear(),
                                    month: s.getMonth() + 1
                                } : {
                                    year: a.getFullYear(),
                                    month: a.getMonth() + 1
                                })),
                                !n.schedules || !qe) {
                                    e.next = 24;
                                    break
                                }
                                if (!(r = n.schedules.find((function(e) {
                                    return "".concat(e.user_visiting_reservation_id) === "".concat(qe)
                                }
                                )))) {
                                    e.next = 24;
                                    break
                                }
                                if (i = r.entrance_date,
                                l = null !== (o = U.d4.local(i)) && void 0 !== o ? o : new Date(0),
                                c = U.NT.date.custom("YYYY-MM-DD", l),
                                u = U.NT.date.custom("YYYY-MM-DD", (0,
                                U.J9)(new Date((0,
                                U.$0)()))),
                                !(U.d4.local(c) < U.d4.local(u))) {
                                    e.next = 19;
                                    break
                                }
                                return e.abrupt("return");
                            case 19:
                                ge(c),
                                e_(null !== i && void 0 !== i ? i : null),
                                ke(r.start_time),
                                De(r.schedule_name),
                                Ge("".concat(r.gate_type));
                            case 24:
                                return e.t0 = me,
                                e.next = 27,
                                f_(i);
                            case 27:
                                return e.t1 = e.sent,
                                (0,
                                e.t0)(e.t1),
                                e.t2 = H,
                                e.next = 32,
                                k_(t, i);
                            case 32:
                                return e.t3 = e.sent,
                                (0,
                                e.t2)(e.t3),
                                e.t4 = ce,
                                e.next = 37,
                                j_(t, i);
                            case 37:
                                e.t5 = e.sent,
                                (0,
                                e.t4)(e.t5);
                            case 39:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(_) {
                    return e.apply(this, arguments)
                }
            }(), p_ = function() {
                var e = (0,
                a.Z)(d().mark((function e(_) {
                    var i, s;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                n.default().get("/api/d/my/tickets/".concat(_, "/reservations"), {
                                    params: {
                                        user_visiting_reservation_id: qe
                                    }
                                }).catch((function(e) {
                                    if (I(!1),
                                    (0,
                                    o.Z)(e, m.AxiosError)) {
                                        var n, i = (0,
                                        ie.Yi)(e).generalError;
                                        switch (null === (n = e.response) || void 0 === n ? void 0 : n.status) {
                                        case 404:
                                            var s = {
                                                error: {
                                                    name: "",
                                                    message: "",
                                                    detail: (0,
                                                    r.Z)({
                                                        errors: []
                                                    }, _, ["CMN_ERR_VALIDATE_0101"])
                                                }
                                            };
                                            Qe(!0),
                                            ze(s);
                                            break;
                                        case 422:
                                            "th_error" === (null === i || void 0 === i ? void 0 : i.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_64", null === i || void 0 === i ? void 0 : i.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_94");
                                            break;
                                        default:
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_14")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_14")
                                }
                                ));
                            case 2:
                                if (i = e.sent) {
                                    e.next = 5;
                                    break
                                }
                                return e.abrupt("return");
                            case 5:
                                return s = i.data,
                                e.abrupt("return", s);
                            case 7:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(_) {
                    return e.apply(this, arguments)
                }
            }(), f_ = function() {
                var e = (0,
                a.Z)(d().mark((function e(_) {
                    var i, s;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                n.default().get("/api/d/lottery_calendars?entrance_date=".concat(_)).catch((function(e) {
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var _, n = (0,
                                        ie.Yi)(e).generalError;
                                        switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                        case 404:
                                            t.notifySystemError("E_SW_GP_DL_117_9_404_15");
                                            break;
                                        case 422:
                                            "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_65", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_95");
                                            break;
                                        default:
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_15")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_15")
                                }
                                ));
                            case 2:
                                if (i = e.sent) {
                                    e.next = 5;
                                    break
                                }
                                return e.abrupt("return");
                            case 5:
                                return s = i.data,
                                e.abrupt("return", s);
                            case 7:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(_) {
                    return e.apply(this, arguments)
                }
            }(), k_ = function() {
                var e = (0,
                a.Z)(d().mark((function e(_, i) {
                    var s, a;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                n.default().get("/api/d/my/tickets/".concat(_, "/month_lotteries"), {
                                    params: {
                                        entrance_date: i
                                    }
                                }).catch((function(e) {
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var _, n = (0,
                                        ie.Yi)(e).generalError;
                                        switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                        case 404:
                                            t.notifySystemError("E_SW_GP_DL_117_9_404_15");
                                            break;
                                        case 422:
                                            "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_65", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_95");
                                            break;
                                        default:
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_15")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_15")
                                }
                                ));
                            case 2:
                                if (s = e.sent) {
                                    e.next = 5;
                                    break
                                }
                                return e.abrupt("return");
                            case 5:
                                return a = s.data,
                                e.abrupt("return", a);
                            case 7:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(_, t) {
                    return e.apply(this, arguments)
                }
            }(), j_ = function() {
                var e = (0,
                a.Z)(d().mark((function e(_, i) {
                    var s, a;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                n.default().get("/api/d/my/tickets/".concat(_, "/day_lotteries"), {
                                    params: {
                                        entrance_date: i
                                    }
                                }).catch((function(e) {
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var _, n = (0,
                                        ie.Yi)(e).generalError;
                                        switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                        case 404:
                                            t.notifySystemError("E_SW_GP_DL_117_9_404_16");
                                            break;
                                        case 422:
                                            "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_66", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_96");
                                            break;
                                        default:
                                            t.notifySystemError("E_SW_GP_DL_117_9_900_16")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_16")
                                }
                                ));
                            case 2:
                                if (s = e.sent) {
                                    e.next = 5;
                                    break
                                }
                                return e.abrupt("return");
                            case 5:
                                return a = s.data,
                                e.abrupt("return", a);
                            case 7:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(_, t) {
                    return e.apply(this, arguments)
                }
            }();
            (0,
            y.useEffect)((function() {
                _.query.id && _.query.screen_id ? (_.query.id && "string" === typeof _.query.id && Ee(_.query.id.split(",")),
                s.includes(ne.n.myticket) ? Ce(K.toTicketDetail) : s.includes(ne.n.ticketSelection) && Ce(K.toTicketSelect),
                S_().then((function() {
                    _.query.type && "change" === _.query.type && (Oe(!0),
                    g_(_.query.id)),
                    Ie(!0)
                }
                ))) : x_()
            }
            ), []);
            var S_ = function() {
                var e = (0,
                a.Z)(d().mark((function e() {
                    var i;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return i = _.query.id.split(",").map((function(e) {
                                    return "ticket_ids[]=".concat(e)
                                }
                                )).join("&"),
                                e.next = 3,
                                n.default().get("/api/d/entrance_schedule_disp_range?".concat(i)).then((function(e) {
                                    if (a_({
                                        start: e.data.entrance_date_from,
                                        end: e.data.entrance_date_to
                                    }),
                                    !_.query.type || "change" !== _.query.type) {
                                        var t = e.data.entrance_date_from
                                          , n = (0,
                                        l.Z)(U.NT.date.custom("YYYY.MM", U.d4.local(t)).split(".").map((function(e) {
                                            return Number(e)
                                        }
                                        )), 2)
                                          , i = n[0]
                                          , s = n[1];
                                        i && s && n_({
                                            year: i,
                                            month: s
                                        })
                                    }
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    o.Z)(e, m.AxiosError)) {
                                        var _, n = (0,
                                        ie.Yi)(e).generalError;
                                        switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                        case 404:
                                        default:
                                            x_();
                                            break;
                                        case 409:
                                            t.notifySystemError("E_SW_GP_DL_117_9_409_1");
                                            break;
                                        case 422:
                                            "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_6", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_9")
                                        }
                                    } else
                                        t.notifySystemError("E_SW_GP_DL_117_9_999_1")
                                }
                                ));
                            case 3:
                                return e.abrupt("return", e.sent);
                            case 4:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function() {
                    return e.apply(this, arguments)
                }
            }()
              , D_ = function() {
                if (s.includes(ne.n.myticket)) {
                    var e = s.filter((function(e) {
                        return e !== ne.n.myticket
                    }
                    )).join(",");
                    _.push((0,
                    ae.A0)(_.asPath, "/myticket_detail/?screen_id=".concat(e, "&id=").concat(We[0], "&reserve_id=").concat(qe)))
                } else
                    _.push((0,
                    ae.A0)(_.asPath, "/ticket_selection/?screen_id=".concat(_.query.screen_id, "&lottery=").concat(se.z8.entrance_date, "&id=").concat(_.query.id)))
            };
            return (0,
            u.jsxs)("div", {
                className: v().main,
                children: [(0,
                u.jsx)("h1", {
                    className: v().main__page_title,
                    children: (0,
                    u.jsx)(f.Z, {
                        messageCode: "SW_GP_DL_101_0101"
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__other_link,
                    children: (0,
                    u.jsx)(f.Z, {
                        messageCode: "SW_GP_DL_117_0003"
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__other_link,
                    children: (0,
                    u.jsx)(f.Z, {
                        messageCode: "SW_GP_DL_117_0004"
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__visit_hope_date_title,
                    children: (0,
                    u.jsx)(f.Z, {
                        messageCode: "SW_GP_DL_101_0002"
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__calendar,
                    children: Ae ? (0,
                    u.jsx)(_e.f, {
                        loading: A,
                        updateSelectedDate: function(e) {
                            ge(e),
                            Ge(""),
                            y_({
                                type: "",
                                display: "",
                                time: ""
                            })
                        },
                        schedules: ye,
                        updateSchedules: function(e) {
                            var i = e.getFullYear()
                              , s = e.getMonth() + 1;
                            I(!0);
                            var a = _.query.id
                              , r = (a ? a.split(",") : []).map((function(e) {
                                return "ticket_ids[]=".concat(e)
                            }
                            )).join("&");
                            n.default().get("/api/d/schedules/".concat(i, "/").concat(s, "?").concat(r)).then((function(e) {
                                he(e.data),
                                I(!1)
                            }
                            )).catch((function(e) {
                                if (I(!1),
                                (0,
                                o.Z)(e, m.AxiosError)) {
                                    var _, n = (0,
                                    ie.Yi)(e).generalError;
                                    switch (null === (_ = e.response) || void 0 === _ ? void 0 : _.status) {
                                    case 404:
                                        x_();
                                        break;
                                    case 422:
                                        "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? t.notifySystemError("E_SW_GP_DL_117_9_422_63", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : t.notifySystemError("E_SW_GP_DL_117_9_422_93");
                                        break;
                                    default:
                                        t.notifySystemError("E_SW_GP_DL_117_9_900_13")
                                    }
                                } else
                                    t.notifySystemError("E_SW_GP_DL_117_9_999_13")
                            }
                            ))
                        },
                        initialDate: $e,
                        initialYearMonth: t_,
                        scheduleRange: s_,
                        screenId: ne.n.ticketVisitingReservation
                    }) : (0,
                    u.jsx)(p.Z, {})
                }), (0,
                u.jsxs)("div", {
                    className: v().main__usage,
                    children: [(0,
                    u.jsx)("div", {
                        className: v().usage_1,
                        children: (0,
                        u.jsx)("div", {
                            className: v().usage_1__text,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0114"
                            })
                        })
                    }), (0,
                    u.jsxs)("div", {
                        className: v().usage_2,
                        children: [(0,
                        u.jsx)("div", {
                            className: v().usage_2__img,
                            children: (0,
                            u.jsx)("img", {
                                src: "/asset/img/ico_scale_high.svg",
                                alt: (0,
                                O.G)(c_, "SW_GP_DL_117_0111")
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: v().usage_2__text,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_101_0321"
                            })
                        })]
                    }), (0,
                    u.jsxs)("div", {
                        className: v().usage_2,
                        children: [(0,
                        u.jsx)("div", {
                            className: v().usage_2__img,
                            children: (0,
                            u.jsx)("img", {
                                src: "/asset/img/ico_scale_low.svg",
                                alt: (0,
                                O.G)(c_, "SW_GP_DL_117_0112")
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: v().usage_2__text,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_101_0323"
                            })
                        })]
                    }), (0,
                    u.jsxs)("div", {
                        className: v().usage_3,
                        children: [(0,
                        u.jsx)("div", {
                            className: v().usage_3__img,
                            children: (0,
                            u.jsx)("img", {
                                src: "/asset/img/calendar_ng.svg",
                                alt: (0,
                                O.G)(c_, "SW_GP_DL_117_0113")
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: v().usage_3__text,
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_101_0325"
                            })
                        })]
                    })]
                }), !1, (0,
                u.jsx)("div", {
                    className: v().main__time_selector,
                    children: (0,
                    u.jsx)("div", {
                        className: v().main__desired_time,
                        children: (0,
                        u.jsx)($.T, {
                            date: ve,
                            getSelectTime: y_,
                            data: ye,
                            screenId: ne.n.ticketVisitingReservation,
                            selectTime: fe,
                            selectGate: Pe,
                            messageIds: {
                                accessLabel: "SW_GP_DL_117_0507",
                                accessDescription: "SW_GP_DL_117_0505",
                                routeLabel: "SW_GP_DL_117_0506",
                                dateDescriptionLabel: "SW_GP_DL_117_0425"
                            }
                        })
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__ticket_count,
                    children: (0,
                    u.jsxs)("div", {
                        className: v().main__ticket_count_box,
                        children: [ve && (0,
                        u.jsxs)("span", {
                            children: [(0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_101_0114"
                            }), "\xa0", (0,
                            M.xS)({
                                time: !1,
                                day: !0
                            }).local(U.d4.local(ve)), "\xa0", Se]
                        }), (0,
                        u.jsx)("div", {
                            className: v().main__ticket_count_wrap,
                            children: 0 !== We.length && (0,
                            u.jsxs)("span", {
                                children: [(0,
                                u.jsx)(f.Z, {
                                    messageCode: "SW_GP_DL_101_0115"
                                }), We.length, (0,
                                u.jsx)(f.Z, {
                                    messageCode: "SW_GP_DL_101_0116"
                                })]
                            })
                        }), function() {
                            if (!Pe)
                                return null;
                            var e = "1" === Pe ? "SW_GP_DL_117_0417" : "SW_GP_DL_117_0418";
                            return (0,
                            u.jsx)("div", {
                                className: v().main__ticket_count_wrap,
                                children: (0,
                                u.jsx)(f.Z, {
                                    messageCode: e,
                                    symbolicDecoration: "lenticular"
                                })
                            })
                        }()]
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__add_cart_button,
                    children: (0,
                    u.jsx)("button", {
                        className: "basic-btn type2 ".concat(v().full),
                        disabled: !fe || A || 0 === We.length || Te && q && q.schedules && q.schedules[0].entrance_date === ve.replace(/-/g, "") && q.schedules[0].schedule_name === Se && String(q.schedules[0].gate_type) === Pe,
                        onClick: Te ? function() {
                            j(!0)
                        }
                        : h_,
                        children: (0,
                        u.jsx)("span", {
                            className: "btn-text",
                            children: (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_101_0118"
                            })
                        })
                    })
                }), (0,
                u.jsx)("div", {
                    className: v().main__prev_button,
                    children: (0,
                    u.jsx)("button", {
                        type: "button",
                        className: "basic-btn type3",
                        onClick: D_,
                        children: (0,
                        u.jsxs)("span", {
                            className: "btn-text",
                            children: [s.includes(ne.n.myticket) && (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0123"
                            }), s.includes(ne.n.ticketSelection) && (0,
                            u.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_117_0124"
                            })]
                        })
                    })
                }), (0,
                u.jsx)(X, {
                    changeReserve: v_,
                    dayLotteries: null === le || void 0 === le ? void 0 : le.list,
                    isOpen: b,
                    monthLotteries: null === z || void 0 === z ? void 0 : z.list,
                    newEntranceDate: ve.replace(/-/g, ""),
                    newGateType: Pe,
                    newScheduleName: Se,
                    onTheDayCalendar: null === ue || void 0 === ue ? void 0 : ue.on_the_day_reservation,
                    selectTime: fe,
                    ticket: q,
                    toggleIsOpen: function() {
                        return j(!b)
                    }
                }), (0,
                u.jsx)(k.Z, {
                    isOpen: Ue,
                    toggleIsOpen: function() {
                        return Be(!Ue)
                    }
                }), (0,
                u.jsx)(Y, {
                    href: "/myticket_detail/?id=".concat(We[0], "&reserve_id=").concat(qe),
                    isOpen: G,
                    toggleIsOpen: function() {
                        return N(!G)
                    }
                }), (0,
                u.jsx)(W, {
                    isOpen: D,
                    toggleIsOpen: function() {
                        return L(!D)
                    },
                    date: "".concat((0,
                    M.xS)({
                        time: !1,
                        day: !0
                    }).local(U.d4.local(ve)), " \n").concat(Se),
                    gate: "".concat((0,
                    B.o)((0,
                    O.G)(c_, "1" === Pe ? "SW_GP_DL_117_0417" : "SW_GP_DL_117_0418"))),
                    href: function() {
                        if (s.includes(ne.n.myticket)) {
                            var e = s.filter((function(e) {
                                return e !== ne.n.myticket
                            }
                            )).join(",");
                            return (0,
                            ae.A0)(_.asPath, "/myticket_detail/?screen_id=".concat(e, "&id=").concat(We[0], "&reserve_id=").concat(qe))
                        }
                        return (0,
                        ae.A0)(_.asPath, "/myticket/")
                    }()
                }), (0,
                u.jsx)(C, {
                    isOpen: Z,
                    toggleIsOpen: function() {
                        return w(!Z)
                    },
                    messageIds: u_ === Q.failedReservation ? {
                        title: "SW_GP_DL_101_0141",
                        description: "SW_GP_DL_101_0142",
                        close: "SW_GP_DL_101_0140"
                    } : {
                        title: "SW_GP_DL_117_0601",
                        description: "SW_GP_DL_117_0602",
                        close: "SW_GP_DL_117_0603"
                    }
                }), (0,
                u.jsx)(te.E, {
                    isOpen: o_,
                    entranceDate: ve,
                    toggleModal: function() {
                        return l_(!o_)
                    }
                }), (0,
                u.jsx)(ee.Y, {
                    isOpen: Ke,
                    validationError: Je,
                    type: "multiple",
                    toggleIsOpen: D_
                })]
            })
        }
    },
    86231: function(e) {
        e.exports = {
            main_contents: "style_main_contents__TWkgl",
            content_block: "style_content_block__LPAis",
            common_text: "style_common_text__BiI2B",
            common_text_border_and_icon: "style_common_text_border_and_icon__c1CRj",
            common_text_border: "style_common_text_border__E5V1f",
            link_main_title: "style_link_main_title__n_389",
            link_big_title: "style_link_big_title__T4Unl",
            link_little_title: "style_link_little_title__dwcI3",
            border_line: "style_border_line__Q2rYz",
            link_text: "style_link_text__LOkYz",
            text_with_caution: "style_text_with_caution__OY8F3",
            caution_mark: "style_caution_mark__yXlpk",
            link_a_wrapper: "style_link_a_wrapper__uK8uJ",
            link_big_button: "style_link_big_button__mXT0K",
            link_buttons: "style_link_buttons__CYcE8",
            link_little_button: "style_link_little_button__Ng4RU",
            link_little_button_disabled: "style_link_little_button_disabled__JtyBX",
            link_little_button_black: "style_link_little_button_black__PLSAW",
            link_icon: "style_link_icon__QDPGS",
            link_icon_before: "style_link_icon_before__QFV_q",
            caution_text: "style_caution_text__4wlFZ",
            invoice_note: "style_invoice_note__t_JYg",
            invoice_notation: "style_invoice_notation__RUcZY",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__1rVa6",
            invoice_notation__registration: "style_invoice_notation__registration__xNeKa",
            invoice_notation__term: "style_invoice_notation__term__AAwVd",
            main: "style_main__S_Vzm",
            main__title: "style_main__title__pJWKF",
            main__notes: "style_main__notes__vrvm6",
            main__button: "style_main__button__dURC2",
            title: "style_title__SoFag",
            close_button: "style_close_button__MvbFz"
        }
    },
    84770: function(e) {
        e.exports = {
            main_contents: "style_main_contents__P60_9",
            content_block: "style_content_block___J24d",
            common_text: "style_common_text__UZ5gn",
            common_text_border_and_icon: "style_common_text_border_and_icon__lwxCS",
            common_text_border: "style_common_text_border__DAOYn",
            link_main_title: "style_link_main_title__Mm76G",
            link_big_title: "style_link_big_title__xNZAf",
            link_little_title: "style_link_little_title__9iplU",
            border_line: "style_border_line__exj9k",
            link_text: "style_link_text__FBHKq",
            text_with_caution: "style_text_with_caution__PYTa1",
            caution_mark: "style_caution_mark__LBB5V",
            link_a_wrapper: "style_link_a_wrapper__Ck8IV",
            link_big_button: "style_link_big_button__MF6LD",
            link_buttons: "style_link_buttons__L0kPB",
            link_little_button: "style_link_little_button__YYzPL",
            link_little_button_disabled: "style_link_little_button_disabled__cdcB0",
            link_little_button_black: "style_link_little_button_black___3aO_",
            link_icon: "style_link_icon__kiy6I",
            link_icon_before: "style_link_icon_before__i2yFW",
            caution_text: "style_caution_text__a_pCG",
            invoice_note: "style_invoice_note__9q6CE",
            invoice_notation: "style_invoice_notation__bNLk0",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__r4j6V",
            invoice_notation__registration: "style_invoice_notation__registration__OUtMJ",
            invoice_notation__term: "style_invoice_notation__term__BBg0q",
            buy: "style_buy__K19ya",
            sub_text: "style_sub_text__J2Lka",
            calendar_icon: "style_calendar_icon__Deho4",
            visit_message: "style_visit_message__H_ZEY",
            "buy-modal": "style_buy-modal__5BTp2",
            parking: "style_parking__BbpuQ",
            parking__title: "style_parking__title__JxgPO",
            parking__link: "style_parking__link__gYYid",
            parking__description: "style_parking__description__VeqEr",
            close_btn: "style_close_btn__FGHTz"
        }
    },
    84360: function(e) {
        e.exports = {
            main_contents: "style_main_contents__IvsjV",
            content_block: "style_content_block___UUxy",
            common_text: "style_common_text__RtM7v",
            common_text_border_and_icon: "style_common_text_border_and_icon__ZxVad",
            common_text_border: "style_common_text_border__BhHru",
            link_main_title: "style_link_main_title__9z3ua",
            link_big_title: "style_link_big_title__E8IZ0",
            link_little_title: "style_link_little_title__rlyPn",
            border_line: "style_border_line__MEXs5",
            link_text: "style_link_text__6rwDr",
            text_with_caution: "style_text_with_caution__MQyo_",
            caution_mark: "style_caution_mark__mcNiY",
            link_a_wrapper: "style_link_a_wrapper__zB8TV",
            link_big_button: "style_link_big_button__E4vSy",
            link_buttons: "style_link_buttons__KZ0W1",
            link_little_button: "style_link_little_button__5_cbT",
            link_little_button_disabled: "style_link_little_button_disabled__uMpAB",
            link_little_button_black: "style_link_little_button_black__s5hA3",
            link_icon: "style_link_icon__05tEf",
            link_icon_before: "style_link_icon_before__TbcI_",
            caution_text: "style_caution_text__jXTIf",
            invoice_note: "style_invoice_note__qZt8A",
            invoice_notation: "style_invoice_notation__iIHFu",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__61vCk",
            invoice_notation__registration: "style_invoice_notation__registration__4ON7O",
            invoice_notation__term: "style_invoice_notation__term__l5Dpm",
            buy: "style_buy__2YcAY",
            calendar_icon: "style_calendar_icon__iEQUb",
            "buy-modal": "style_buy-modal__1JZtS"
        }
    },
    63014: function(e) {
        e.exports = {
            main_contents: "style_main_contents___QcN4",
            content_block: "style_content_block__cAh81",
            common_text: "style_common_text__XCkko",
            common_text_border_and_icon: "style_common_text_border_and_icon__rQkGe",
            common_text_border: "style_common_text_border__YuL6P",
            link_main_title: "style_link_main_title__I6GZ5",
            link_big_title: "style_link_big_title__6NBGn",
            link_little_title: "style_link_little_title__MDthH",
            border_line: "style_border_line__msMOn",
            link_text: "style_link_text__6CgiG",
            text_with_caution: "style_text_with_caution__8NhFJ",
            caution_mark: "style_caution_mark__AbD4O",
            link_a_wrapper: "style_link_a_wrapper__BGaDF",
            link_big_button: "style_link_big_button__nGUn2",
            link_buttons: "style_link_buttons__V7dl3",
            link_little_button: "style_link_little_button__sQNow",
            link_little_button_disabled: "style_link_little_button_disabled__OC9Oe",
            link_little_button_black: "style_link_little_button_black__DvIrG",
            link_icon: "style_link_icon__B5wI_",
            link_icon_before: "style_link_icon_before__dVPXa",
            caution_text: "style_caution_text__2FJsQ",
            invoice_note: "style_invoice_note__QRXOO",
            invoice_notation: "style_invoice_notation__CPseu",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__XPi2E",
            invoice_notation__registration: "style_invoice_notation__registration__KGQBl",
            invoice_notation__term: "style_invoice_notation__term__ViZ2Y",
            main__title: "style_main__title__i8bBq",
            main__icon: "style_main__icon__364bE",
            main__button: "style_main__button__sZTiQ",
            close_button: "style_close_button__Dxde2"
        }
    },
    14449: function(e) {
        e.exports = {
            main_contents: "style_main_contents___hUGY",
            content_block: "style_content_block___IQao",
            common_text: "style_common_text__SoBS_",
            common_text_border_and_icon: "style_common_text_border_and_icon__mz0k9",
            common_text_border: "style_common_text_border__soWmK",
            link_main_title: "style_link_main_title__GHYFp",
            link_big_title: "style_link_big_title__T_4pX",
            link_little_title: "style_link_little_title__vxgaN",
            border_line: "style_border_line__LxcK1",
            link_text: "style_link_text__0EQu9",
            text_with_caution: "style_text_with_caution__AT2QA",
            caution_mark: "style_caution_mark__0fkQK",
            link_a_wrapper: "style_link_a_wrapper__iC0c5",
            link_big_button: "style_link_big_button__mS0zM",
            link_buttons: "style_link_buttons__iTsxJ",
            link_little_button: "style_link_little_button___Gf3e",
            link_little_button_disabled: "style_link_little_button_disabled__fAh61",
            link_little_button_black: "style_link_little_button_black___Q9Fl",
            link_icon: "style_link_icon__m7KnZ",
            link_icon_before: "style_link_icon_before__k_RUt",
            caution_text: "style_caution_text__Yi_Wr",
            invoice_note: "style_invoice_note__jDJQo",
            invoice_notation: "style_invoice_notation__4NSUj",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__BfpU0",
            invoice_notation__registration: "style_invoice_notation__registration__Zelke",
            invoice_notation__term: "style_invoice_notation__term__ze5_B",
            main__title: "style_main__title__gPhh9",
            main__confirm: "style_main__confirm__58YhI",
            main__on_the_day_alert: "style_main__on_the_day_alert__37pvf",
            main__head: "style_main__head__n643E",
            main__visit_date: "style_main__visit_date__bWSvl",
            main__sub_head: "style_main__sub_head__wlGqv",
            main__none: "style_main__none__pOFCl",
            main__info: "style_main__info__EuSQ4",
            main__img: "style_main__img__Y5bVw",
            main__button: "style_main__button__fac_Z",
            main: "style_main__Cc56T",
            next_button: "style_next_button__N_pbs",
            close_button: "style_close_button__QKUVO"
        }
    },
    64800: function(e) {
        e.exports = {
            modal__header: "style_modal__header__bBtX_",
            modal__head: "style_modal__head___jAzE",
            modal__alert_messages: "style_modal__alert_messages__RUJa4",
            modal__close_btn: "style_modal__close_btn__ncyVS",
            modal__error: "style_modal__error__iG8xk"
        }
    },
    57324: function(e) {
        e.exports = {
            content: "style_content___pU7i"
        }
    },
    95088: function(e) {
        e.exports = {
            content: "style_content__xkX2r"
        }
    },
    39584: function(e) {
        e.exports = {
            main: "style_main__qiwIC",
            main__title: "style_main__title__Xsv97",
            main__description: "style_main__description__NVsQw"
        }
    },
    20114: function(e) {
        e.exports = {
            main: "style_main__Zc_gn",
            main__h1: "style_main__h1__IjbfS",
            main__h2: "style_main__h2__u7DPj",
            main__h3: "style_main__h3__0QsBx",
            main__column: "style_main__column__F6hGa",
            main__section: "style_main__section__hVTfj",
            external_link: "style_external_link__bU2_r",
            external_link_icon: "style_external_link_icon__oXVl9"
        }
    },
    19062: function(e) {
        e.exports = {
            main_contents: "style_main_contents__Fl7uP",
            content_block: "style_content_block__rRrKl",
            common_text: "style_common_text__fCzZU",
            common_text_border_and_icon: "style_common_text_border_and_icon__Q_RBD",
            common_text_border: "style_common_text_border__Nk5fj",
            link_main_title: "style_link_main_title__tN79_",
            link_big_title: "style_link_big_title__bREGe",
            link_little_title: "style_link_little_title__IsdpV",
            border_line: "style_border_line__O6mJj",
            link_text: "style_link_text__fpYzO",
            text_with_caution: "style_text_with_caution__bLTuZ",
            caution_mark: "style_caution_mark__k1BHr",
            link_a_wrapper: "style_link_a_wrapper__0nq_t",
            link_big_button: "style_link_big_button__3hCXA",
            link_buttons: "style_link_buttons__bvElh",
            link_little_button: "style_link_little_button__RetmK",
            link_little_button_disabled: "style_link_little_button_disabled__IogmI",
            link_little_button_black: "style_link_little_button_black__22PX9",
            link_icon: "style_link_icon__Xqytm",
            link_icon_before: "style_link_icon_before__LwRCO",
            caution_text: "style_caution_text__ADh6S",
            invoice_note: "style_invoice_note__wdAzo",
            invoice_notation: "style_invoice_notation__tcKU3",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__JvCxl",
            invoice_notation__registration: "style_invoice_notation__registration__rapuF",
            invoice_notation__term: "style_invoice_notation__term__TlhOZ",
            main: "style_main__sp5FN",
            main__page_title: "style_main__page_title__c7e_v",
            main__other_link: "style_main__other_link__WSeX7",
            main__event_plan_btn: "style_main__event_plan_btn__MiFSC",
            main__visit_hope_date_title: "style_main__visit_hope_date_title__OWArh",
            main__calendar: "style_main__calendar__HRSsz",
            main__usage: "style_main__usage__GPY6i",
            main__desired_time: "style_main__desired_time__AcQz0",
            main__time_selector: "style_main__time_selector__autdL",
            main__ticket_count: "style_main__ticket_count__sXoGn",
            main__ticket_count_box: "style_main__ticket_count_box__d4T6I",
            main__ticket_count_wrap: "style_main__ticket_count_wrap___X_aT",
            main__add_cart_button: "style_main__add_cart_button__DCOw8",
            main__prev_button: "style_main__prev_button__gJ5ZR",
            full: "style_full__ptzZq",
            usage_1: "style_usage_1__K9ZJj",
            usage_1__text: "style_usage_1__text__hEaf8",
            usage_2: "style_usage_2__Eam_f",
            usage_2__img: "style_usage_2__img__4AVsX",
            usage_2__text: "style_usage_2__text__3Y91K",
            usage_3: "style_usage_3__N1Yjn",
            usage_3__img: "style_usage_3__img__wV6oE",
            usage_3__text: "style_usage_3__text__PrprA"
        }
    }
}, function(e) {
    e.O(0, [5662, 7201, 7815, 9774, 2888, 179], (function() {
        return _ = 19089,
        e(e.s = _);
        var _
    }
    ));
    var _ = e.O();
    _N_E = _
}
]);
