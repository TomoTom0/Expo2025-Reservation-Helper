(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[6730], {
    66137: function(e, _, t) {
        (window.__NEXT_P = window.__NEXT_P || []).push(["/agent_ticket", function() {
            return t(62868)
        }
        ])
    },
    62868: function(e, _, t) {
        "use strict";
        t.r(_),
        t.d(_, {
            default: function() {
                return j
            }
        });
        var a = t(82670)
          , n = t(29815)
          , i = t(85893)
          , r = t(9669)
          , s = t(11163)
          , o = t(67294)
          , c = t(9473)
          , d = t(40306)
          , l = t.n(d)
          , m = t(9691)
          , u = t(56739)
          , h = t(64405)
          , f = t(15273)
          , y = t(87316)
          , g = t(68014)
          , v = t(42330)
          , S = t(82889)
          , E = t(99043)
          , p = t(77186)
          , x = t(26111)
          , j = function() {
            var e = (0,
            s.useRouter)()
              , _ = (0,
            x.$M)(e)
              , t = (0,
            o.useContext)(m.T).apiClient
              , d = (0,
            o.useContext)(u.T)
              , j = (0,
            c.v9)((function(e) {
                return e.messages
            }
            ))
              , b = (0,
            o.useState)("")
              , k = b[0]
              , L = b[1]
              , P = (0,
            o.useState)("")
              , D = P[0]
              , G = P[1]
              , W = (0,
            o.useState)(!1)
              , N = W[0]
              , C = W[1]
              , w = (0,
            o.useState)([])
              , Z = w[0]
              , A = w[1]
              , R = (0,
            o.useState)("")
              , q = R[0]
              , M = R[1]
              , T = (0,
            o.useState)(!1)
              , I = T[0]
              , F = T[1]
              , O = (0,
            o.useState)([])
              , z = O[0]
              , H = O[1]
              , K = e.query.lottery
              , V = (0,
            o.useRef)(!1)
              , Y = function() {
                var _ = arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
                  , t = "";
                _ ? t = e.query.id ? "&id=".concat(e.query.id) : "" : Z.length > 0 && (t = "&id=".concat(Z.map((function(e) {
                    return e.ticket_id
                }
                )).join(",")));
                var a = e.query.screen_id ? "&screen_id=".concat(e.query.screen_id) : ""
                  , n = "?lottery=".concat(e.query.lottery).concat(t).concat(a)
                  , i = (0,
                x.A0)(e.asPath, "/ticket_selection/".concat(n));
                e.push(i)
            };
            return (0,
            o.useEffect)((function() {
                if (!K) {
                    var _ = (0,
                    x.A0)(e.asPath, "");
                    e.push(_)
                }
                if (!(0,
                E.p)(K) && E.z8.entrance_date !== K) {
                    var a = (0,
                    x.A0)(e.asPath, "/");
                    e.push(a)
                }
                t.default().get("/api/d/proxy_tickets?registered_channel=".concat(K, "&limit=13")).then((function(e) {
                    return A(e.data.list)
                }
                ))
            }
            ), []),
            (0,
            i.jsxs)(i.Fragment, {
                children: [(0,
                i.jsxs)("div", {
                    className: l().main,
                    children: [(0,
                    i.jsx)("h2", {
                        className: l().main__head,
                        children: (0,
                        i.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_167_0101"
                        })
                    }), (0,
                    i.jsx)("div", {
                        id: "ticket_id_input",
                        children: (0,
                        i.jsx)(f.Z, {
                            is: "p",
                            className: l().main__caption,
                            messageCode: "SW_GP_DL_167_0102",
                            tabIndex: d.focusability.main ? 0 : -1
                        })
                    }), (0,
                    i.jsx)("div", {
                        children: (0,
                        i.jsx)(f.Z, {
                            is: "p",
                            className: l().main__caption,
                            messageCode: "SW_GP_DL_167_0103"
                        })
                    }), (0,
                    i.jsxs)("div", {
                        className: l().main__form,
                        children: [(0,
                        i.jsxs)("dl", {
                            className: l().main__register,
                            children: [(0,
                            i.jsx)("dt", {
                                children: (0,
                                i.jsx)("label", {
                                    htmlFor: "agent_ticket_id_register",
                                    className: l().main__register_label,
                                    children: (0,
                                    i.jsx)(f.Z, {
                                        messageCode: "SW_GP_DL_167_0203"
                                    })
                                })
                            }), (0,
                            i.jsx)("dd", {
                                children: (0,
                                i.jsx)("input", {
                                    id: "agent_ticket_id_register",
                                    className: l().main__register_input,
                                    value: k,
                                    placeholder: (0,
                                    p.G)(j, "SW_GP_DL_167_0201"),
                                    "aria-label": (0,
                                    p.G)(j, "SW_GP_DL_167_0201"),
                                    onChange: function(e) {
                                        return L(e.target.value)
                                    },
                                    maxLength: 10
                                })
                            })]
                        }), (0,
                        i.jsx)("button", {
                            className: ["basic-btn", "type2", l().main__register_btn].join(" "),
                            disabled: N,
                            onClick: function() {
                                return function() {
                                    if (k) {
                                        var e = k.trim();
                                        if (Z.some((function(_) {
                                            return _.ticket_id === e
                                        }
                                        )))
                                            return M("CMN_ERR_VALIDATE_0204"),
                                            void G(e);
                                        Z.length >= 13 ? M("CMN_ERR_VALIDATE_0206") : (C(!0),
                                        t.default().get("/api/d/proxy_tickets/".concat(e, "/add_check?registered_channel=").concat(K), {
                                            validateStatus: function(e) {
                                                return 200 === e || 422 === e
                                            }
                                        }).then((function(_) {
                                            C(!1),
                                            H([]),
                                            G(""),
                                            M("");
                                            var t = _.status;
                                            if (t >= 200 && t < 204) {
                                                var a = [_.data]
                                                  , n = (0,
                                                v.M)(a, !0).concat(Z).filter((function(e) {
                                                    return K === E.z8.entrance_date ? !e.schedule : K === E.z8.fast || !!e.schedule
                                                }
                                                ));
                                                A(n),
                                                L(""),
                                                _.data.reserve_changed_max && (F(!0),
                                                H(["CMN_ERR_VALIDATE_0123"]),
                                                G(e))
                                            } else {
                                                for (var i in _.data.error.detail) {
                                                    var r = _.data.error.detail[i];
                                                    for (var s in r) {
                                                        var o = r[s];
                                                        return M(o),
                                                        void G(e)
                                                    }
                                                }
                                                F(!0),
                                                G(e),
                                                H(_.data.error.detail[e])
                                            }
                                        }
                                        )).catch((function(e) {
                                            if (C(!1),
                                            (0,
                                            a.Z)(e, r.AxiosError)) {
                                                var t, n = (0,
                                                S.Yi)(e), i = n.generalError;
                                                switch (n.validationErrors,
                                                null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                                case 404:
                                                    _.notifySystemError("E_SW_GP_DL_167_9_404_1");
                                                    break;
                                                case 409:
                                                    _.notifySystemError("E_SW_GP_DL_167_9_409_1");
                                                    break;
                                                case 422:
                                                    "th_error" === (null === i || void 0 === i ? void 0 : i.name) ? _.notifySystemError("E_SW_GP_DL_167_9_422_6", null === i || void 0 === i ? void 0 : i.detail.th_error_code) : _.notifySystemError("E_SW_GP_DL_167_9_422_9");
                                                    break;
                                                default:
                                                    _.notifySystemError("E_SW_GP_DL_167_9_900_1")
                                                }
                                            } else
                                                _.notifySystemError("E_SW_GP_DL_167_9_999_1")
                                        }
                                        )))
                                    }
                                }()
                            },
                            children: (0,
                            i.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_167_0202"
                            })
                        })]
                    }), q && (0,
                    i.jsx)(f.Z, {
                        is: "p",
                        className: l().main__error_message,
                        messageCode: q,
                        variables: [{
                            text: D
                        }]
                    }), (0,
                    i.jsxs)("div", {
                        children: [(0,
                        i.jsx)("h1", {
                            className: l().main__head,
                            children: (0,
                            i.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_167_0301"
                            })
                        }), Z.length > 0 && (0,
                        i.jsx)(f.Z, {
                            messageCode: "SW_GP_DL_167_0303",
                            variables: [{
                                text: Z.length.toString()
                            }]
                        })]
                    }), N && (0,
                    i.jsx)("div", {
                        className: l().main__loading,
                        children: (0,
                        i.jsx)(h.Z, {})
                    }), !N && 0 === Z.length && (0,
                    i.jsx)(i.Fragment, {
                        children: (0,
                        i.jsx)("div", {
                            className: l().main__empty,
                            children: (0,
                            i.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_167_0302"
                            })
                        })
                    }), Z.length > 0 && (0,
                    i.jsx)("div", {
                        className: [l().main__card_wrap, "tickets-type1"].join(" "),
                        children: Z.map((function(e, _) {
                            return (0,
                            i.jsx)(o.Fragment, {
                                children: (0,
                                i.jsx)("div", {
                                    className: l().main__ticket_card,
                                    children: (0,
                                    i.jsx)(g.o, {
                                        ticket_id: e.ticket_id,
                                        image: e.image_large_path,
                                        item_name: e.item_name,
                                        disp_status: e.disp_status,
                                        item_summary: e.item_summary,
                                        received_at: e.received_at,
                                        schedule: e.schedule,
                                        is_agent_ticket: !0
                                    })
                                }, _)
                            }, _)
                        }
                        ))
                    }), (0,
                    i.jsxs)("div", {
                        className: l().main__back_btn_area,
                        children: [(0,
                        i.jsx)("button", {
                            className: ["basic-btn", "type2", l().search_btn].join(" "),
                            disabled: N || 0 === Z.length,
                            onClick: function() {
                                V.current || (V.current = !0,
                                t.default().post("/api/d/proxy_tickets", {
                                    ticket_ids: (0,
                                    n.Z)(new Set(Z.map((function(e) {
                                        return e.ticket_id
                                    }
                                    )))),
                                    registered_channel: K
                                }).then((function(e) {
                                    if (!(e.status >= 200 && e.status < 300))
                                        throw new Error;
                                    Y()
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    a.Z)(e, r.AxiosError)) {
                                        var t, n = (0,
                                        S.Yi)(e), i = n.generalError, s = n.validationErrors;
                                        switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                        case 404:
                                            _.notifySystemError("E_SW_GP_DL_167_9_404_12");
                                            break;
                                        case 409:
                                            _.notifySystemError("E_SW_GP_DL_167_9_409_12");
                                            break;
                                        case 422:
                                            var o;
                                            "remainder_not_enough" === (null === i || void 0 === i ? void 0 : i.name) ? _.notifySystemError("E_SW_GP_DL_167_9_422_12") : (null === s || void 0 === s || null === (o = s.qty) || void 0 === o ? void 0 : o.length) > 0 ? _.notifySystemError("E_SW_GP_DL_167_9_422_22") : "has_item_out_of_sale" === (null === i || void 0 === i ? void 0 : i.name) ? _.notifySystemError("E_SW_GP_DL_167_9_422_32") : "entrance_date_unmatch" === (null === i || void 0 === i ? void 0 : i.name) ? _.notifySystemError("E_SW_GP_DL_167_9_422_42") : (null === s || void 0 === s ? void 0 : s.coupon_code) && s.coupon_code.length > 0 ? _.notifySystemError("E_SW_GP_DL_167_9_422_52") : "th_error" === (null === i || void 0 === i ? void 0 : i.name) ? _.notifySystemError("E_SW_GP_DL_167_9_422_62", null === i || void 0 === i ? void 0 : i.detail.th_error_code) : _.notifySystemError("E_SW_GP_DL_167_9_422_92");
                                            break;
                                        default:
                                            _.notifySystemError("E_SW_GP_DL_167_9_900_12")
                                        }
                                    } else
                                        _.notifySystemError("E_SW_GP_DL_167_9_999_12")
                                }
                                )))
                            },
                            children: (0,
                            i.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_167_0401"
                            })
                        }), (0,
                        i.jsx)("button", {
                            className: ["basic-btn", "type3", l().main__back_btn].join(" "),
                            onClick: function() {
                                return Y(!0)
                            },
                            children: (0,
                            i.jsx)(f.Z, {
                                messageCode: "SW_GP_DL_167_0402"
                            })
                        })]
                    })]
                }), (0,
                i.jsx)(y.Y, {
                    isOpen: I,
                    toggleIsOpen: function() {
                        return F(!I)
                    },
                    messages: z,
                    ticketId: D
                })]
            })
        }
    },
    40306: function(e) {
        e.exports = {
            main: "style_main__RADor",
            main__form: "style_main__form__r7l9p",
            main__error_message: "style_main__error_message__oE5HC",
            main__register: "style_main__register__Xr3Iw",
            main__register_input: "style_main__register_input__wHzkJ",
            main__register_btn: "style_main__register_btn__FHBxM",
            main__back_btn: "style_main__back_btn__Q2R3c",
            main__back_btn_area: "style_main__back_btn_area__UK_Kl",
            main__head: "style_main__head__LLhtg",
            main__caption: "style_main__caption__qKmxj",
            main__empty: "style_main__empty__ZgOeu",
            main__loading: "style_main__loading__KYFwT",
            main__card_wrap: "style_main__card_wrap___hMHv",
            main__ticket_card: "style_main__ticket_card__3ZVML"
        }
    }
}, function(e) {
    e.O(0, [5662, 2097, 9774, 2888, 179], (function() {
        return _ = 66137,
        e(e.s = _);
        var _
    }
    ));
    var _ = e.O();
    _N_E = _
}
]);
