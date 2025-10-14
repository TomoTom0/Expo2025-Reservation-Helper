(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[2996], {
    72533: function(e, t, _) {
        (window.__NEXT_P = window.__NEXT_P || []).push(["/event_time", function() {
            return _(19261)
        }
        ])
    },
    19261: function(e, t, _) {
        "use strict";
        _.r(t),
        _.d(t, {
            default: function() {
                return V
            }
        });
        var n, a, i, s = _(47568), r = _(82670), o = _(10253), c = _(29815), l = _(34051), d = _.n(l), u = _(85893), m = _(9669), v = _(47041), h = _(11163), p = _(67294), f = _(9473), y = _(32255), x = _.n(y), g = _(57380), k = _(9691), S = _(56739), b = _(64405), j = _(15273), E = _(23591), D = _(26123), P = _(67201), w = _(36636), N = _(66249), G = _(80027), L = _(3282), W = _.n(L), C = function(e) {
            var t = function(t) {
                var _ = e.data.find((function(e) {
                    return e.time === t.target.value
                }
                ));
                e.onChange(_)
            }
              , _ = (0,
            c.Z)(e.data).sort((function(e, t) {
                return Number.parseInt(e.time) > Number.parseInt(t.time) ? 1 : -1
            }
            ));
            return (0,
            u.jsx)("div", {
                className: W().time_picker,
                children: _.map((function(_, n) {
                    return (0,
                    u.jsxs)("div", {
                        className: W().time_picker__wrap,
                        children: [(0,
                        u.jsx)("div", {
                            className: "".concat(W().time_picker__row, " ").concat(_.disabled ? W().time_picker__disabled : ""),
                            children: (0,
                            u.jsxs)("label", {
                                className: [W().time_picker__inner, e.value === _.time ? W().time_picker__selected : ""].join(" "),
                                children: [_.icon && (0,
                                u.jsx)("span", {
                                    className: W().time_picker__icon_area,
                                    children: (0,
                                    u.jsx)("img", {
                                        src: _.icon,
                                        alt: _.alt,
                                        className: W().time_picker__icon
                                    })
                                }), (0,
                                u.jsx)("input", {
                                    type: "radio",
                                    name: "date_picker",
                                    className: W().time_picker__radio,
                                    value: _.time,
                                    checked: e.value === _.time,
                                    disabled: !!_.disabled,
                                    onChange: t
                                }), "\xa0", (0,
                                u.jsx)("span", {
                                    children: _.name
                                })]
                            })
                        }), _.disabledMessageCode && (0,
                        u.jsx)("p", {
                            className: W().time_picker__error,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: _.disabledMessageCode
                            })
                        })]
                    }, n)
                }
                ))
            })
        }, z = _(62197), Z = _(36385), O = _(36355), A = _(42719), M = _(22146), T = _(61223), I = _(82889), F = _(77714), Y = _(99043), q = _(77186), R = _(51438), U = function() {
            function e(t) {
                (0,
                R.Z)(this, e),
                this.priority = t
            }
            var t = e.prototype;
            return t.isNumber = function() {
                return !Number.isNaN(this.toNumber())
            }
            ,
            t.toNumber = function() {
                return Number.parseInt(this.priority)
            }
            ,
            t.increment = function() {
                this.priority = (this.toNumber() + 1).toString()
            }
            ,
            e
        }(), B = _(93074), K = _(26111);
        !function(e) {
            e[e.initial = 0] = "initial",
            e[e.loading = 1] = "loading",
            e[e.empty = 2] = "empty",
            e[e.complete = 3] = "complete"
        }(n || (n = {})),
        function(e) {
            e.OK = "0",
            e.FEW = "1",
            e.NG = "2"
        }(a || (a = {})),
        function(e) {
            e[e.RESERVABLE = 0] = "RESERVABLE",
            e[e.STOCK_NONE = 1] = "STOCK_NONE",
            e[e.STOCK_NOT_ENOUGH = 2] = "STOCK_NOT_ENOUGH",
            e[e.ADMISSION_BUFFER = 3] = "ADMISSION_BUFFER",
            e[e.ADMISSION_BEFORE = 4] = "ADMISSION_BEFORE",
            e[e.EVENT_BUFFER = 5] = "EVENT_BUFFER"
        }(i || (i = {}));
        var V = function() {
            var e, t, _, l, y, L, W, R = (0,
            h.useRouter)(), V = (0,
            K.$M)(R), X = (0,
            p.useContext)(k.T).apiClient, H = (0,
            p.useContext)(S.T), Q = (0,
            f.v9)((function(e) {
                return e.messages
            }
            )), $ = null === (e = R.query) || void 0 === e ? void 0 : e.id, J = $ && $.includes(",") ? $.split(",") : [$], ee = null === (t = R.query) || void 0 === t ? void 0 : t.event_id, te = null === (_ = R.query) || void 0 === _ ? void 0 : _.screen_id, _e = "string" === typeof te ? te.split(",") : [], ne = null === (l = R.query) || void 0 === l ? void 0 : l.priority, ae = null === (y = R.query) || void 0 === y ? void 0 : y.lottery, ie = "change" === (null === (L = R.query) || void 0 === L ? void 0 : L.type), se = null === (W = R.query) || void 0 === W ? void 0 : W.keyword, re = (0,
            p.useState)(!0), oe = re[0], ce = re[1], le = (0,
            p.useState)(), de = le[0], ue = le[1], me = (0,
            p.useState)(n.complete), ve = me[0], he = me[1], pe = (0,
            p.useState)(), fe = pe[0], ye = pe[1], xe = (0,
            p.useState)(), ge = xe[0], ke = xe[1], Se = (0,
            p.useState)(), be = Se[0], je = Se[1], Ee = R.query.reserve_id ? R.query.reserve_id : "", De = (0,
            p.useState)(), Pe = De[0], we = De[1], Ne = (0,
            p.useState)(!1), Ge = Ne[0], Le = Ne[1], We = (0,
            p.useState)(!1), Ce = We[0], ze = We[1], Ze = (0,
            p.useState)(!1), Oe = Ze[0], Ae = Ze[1], Me = (0,
            p.useState)(!1), Te = Me[0], Ie = Me[1], Fe = (0,
            p.useState)([]), Ye = Fe[0], qe = Fe[1], Re = (0,
            p.useState)(!1), Ue = Re[0], Be = Re[1], Ke = (0,
            p.useState)(), Ve = Ke[0], Xe = Ke[1], He = (0,
            p.useState)(), Qe = He[0], $e = He[1], Je = (0,
            p.useState)(), et = Je[0], tt = Je[1], _t = (0,
            p.useState)(), nt = _t[0], at = _t[1], it = (0,
            p.useState)(R.query.entrance_date ? R.query.entrance_date : ""), st = it[0], rt = it[1], ot = (0,
            p.useState)([]), ct = ot[0], lt = ot[1], dt = (0,
            p.useState)([]), ut = dt[0], mt = dt[1], vt = (0,
            p.useState)(!1), ht = vt[0], pt = vt[1], ft = (0,
            p.useState)([]), yt = ft[0], xt = ft[1], gt = (0,
            p.useState)(), kt = gt[0], St = gt[1], bt = (0,
            p.useState)(!1), jt = bt[0], Et = bt[1], Dt = (0,
            p.useState)(""), Pt = Dt[0], wt = Dt[1], Nt = (0,
            p.useState)(!1), Gt = Nt[0], Lt = Nt[1], Wt = (0,
            p.useState)(!1), Ct = Wt[0], zt = Wt[1], Zt = (0,
            p.useRef)(!1), Ot = (0,
            p.useRef)(!1), At = ae === Y.z8.seven_days_ago, Mt = ae === Y.z8.two_month_ago, Tt = function() {
                var e = (0,
                s.Z)(d().mark((function e(t) {
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.abrupt("return", new Promise((function(e, _) {
                                    var n = X.default()
                                      , a = Rt()
                                      , i = "?" + J.map((function(e) {
                                        return "ticket_ids[]=".concat(e)
                                    }
                                    )).join("&")
                                      , s = t ? "&entrance_date=".concat(t) : "";
                                    n.get("/api/d/".concat(a, "/pre_list").concat(i).concat(s)).then((function(t) {
                                        if (t.data && t.data.list) {
                                            var _ = t.data.list.map((function(e) {
                                                return {
                                                    entranceDate: e.entrance_date,
                                                    startTime: e.start_time,
                                                    eventCode: e.event_code,
                                                    priority: e.priority
                                                }
                                            }
                                            ));
                                            qe(_),
                                            e(_)
                                        }
                                    }
                                    )).catch((function(e) {
                                        if ((0,
                                        r.Z)(e, m.AxiosError)) {
                                            var t, n = (0,
                                            I.Yi)(e), a = n.generalError;
                                            n.validationErrors;
                                            switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                            case 404:
                                                var i = (0,
                                                K.A0)(R.asPath, "/");
                                                return void R.push(i);
                                            case 409:
                                                V.notifySystemError("E_SW_GP_DL_114_9_409_18");
                                                break;
                                            case 422:
                                                "th_error" === (null === a || void 0 === a ? void 0 : a.name) ? V.notifySystemError("E_SW_GP_DL_114_9_422_68", null === a || void 0 === a ? void 0 : a.detail.th_error_code) : V.notifySystemError("E_SW_GP_DL_114_9_422_98");
                                                break;
                                            default:
                                                var s = (0,
                                                K.A0)(R.asPath, "/");
                                                return void R.push(s)
                                            }
                                        } else
                                            V.notifySystemError("E_SW_GP_DL_114_9_999_18");
                                        _(e)
                                    }
                                    ))
                                }
                                )));
                            case 1:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(t) {
                    return e.apply(this, arguments)
                }
            }();
            (0,
            p.useEffect)((function() {
                var e = ae === Y.z8.someday || ae === Y.z8.empty;
                if (!Ee || Ee.match(/^\d*$/)) {
                    if (e) {
                        if (!$ || !te || !ee || !ae || !J.every((function(e) {
                            return !!e.match(/^[A-Z0-9]+$/)
                        }
                        ))) {
                            var t = (0,
                            K.A0)(R.asPath, "/");
                            return void R.push(t)
                        }
                    } else if (!$ || !te || !ne || !ee || !ae || !J.every((function(e) {
                        return !!e.match(/^[A-Z0-9]+$/)
                    }
                    ))) {
                        var _ = (0,
                        K.A0)(R.asPath, "/");
                        return void R.push(_)
                    }
                    if (_e.every((function(e) {
                        return e === O.n.top || e === O.n.myTicketList || e === O.n.myticket || e === O.n.reservationInformation || e === O.n.passport || e === O.n.ticketSelection || e === O.n.ticketVisitingReservation
                    }
                    )))
                        if ((0,
                        Y.p)(ae)) {
                            if (he(n.loading),
                            ae === Y.z8.fast)
                                X.default().get("/api/d/entrance_schedule_disp_range").then((function(e) {
                                    tt({
                                        start: e.data.entrance_date_from,
                                        end: e.data.entrance_date_to
                                    }),
                                    $e({
                                        year: 2025,
                                        month: 4
                                    })
                                }
                                )),
                                Ft("").then((function() {
                                    he(n.complete),
                                    ce(!1)
                                }
                                )),
                                Tt("");
                            else if (ae === Y.z8.seven_days_ago || ae === Y.z8.two_month_ago || ae === Y.z8.someday || ae === Y.z8.empty) {
                                var a = function() {
                                    var e = (0,
                                    s.Z)(d().mark((function e() {
                                        var t;
                                        return d().wrap((function(e) {
                                            for (; ; )
                                                switch (e.prev = e.next) {
                                                case 0:
                                                    return e.next = 2,
                                                    It();
                                                case 2:
                                                    return t = e.sent,
                                                    At || Mt || ae === Y.z8.empty ? ((At || Mt) && Tt(t),
                                                    X.default().get("/api/d/lottery_calendars?entrance_date=".concat(t)).then((function(e) {
                                                        At ? (ke(e.data.seven_days_ago_lottery),
                                                        zt(!0)) : Mt ? (ke(e.data.two_months_ago_lottery),
                                                        zt(!0)) : ae === Y.z8.empty && ((0,
                                                        B.L3)(e.data.empty_frame_reservation) !== B.WN.requesting ? Lt(!0) : zt(!0))
                                                    }
                                                    )).catch((function(e) {
                                                        if ((0,
                                                        r.Z)(e, m.AxiosError)) {
                                                            var t, _ = (0,
                                                            I.Yi)(e), n = _.generalError;
                                                            _.validationErrors;
                                                            switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                                            case 404:
                                                                V.notifySystemError("E_SW_GP_DL_114_9_404_15");
                                                                break;
                                                            case 409:
                                                                V.notifySystemError("E_SW_GP_DL_114_9_409_15");
                                                                break;
                                                            case 422:
                                                                "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? V.notifySystemError("E_SW_GP_DL_114_9_422_65", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : V.notifySystemError("E_SW_GP_DL_114_9_422_95");
                                                                break;
                                                            default:
                                                                V.notifySystemError("E_SW_GP_DL_114_9_900_15")
                                                            }
                                                        } else
                                                            V.notifySystemError("E_SW_GP_DL_114_9_999_15")
                                                    }
                                                    ))) : ae === Y.z8.someday && zt(!0),
                                                    e.next = 6,
                                                    Ft(t);
                                                case 6:
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
                                }();
                                a().then((function() {
                                    he(n.complete),
                                    ce(!1)
                                }
                                ))
                            }
                        } else {
                            var i = (0,
                            K.A0)(R.asPath, "/");
                            R.push(i)
                        }
                    else {
                        var o = (0,
                        K.A0)(R.asPath, "/");
                        R.push(o)
                    }
                } else {
                    var c = (0,
                    K.A0)(R.asPath, "/");
                    R.push(c)
                }
            }
            ), []);
            var It = function() {
                var e = (0,
                s.Z)(d().mark((function e() {
                    var t, _, n;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return ae === Y.z8.fast && (t = T.d4.local(st),
                                Yt("".concat(null !== (_ = null === t || void 0 === t ? void 0 : t.getFullYear()) && void 0 !== _ ? _ : ""), String((null !== (n = null === t || void 0 === t ? void 0 : t.getMonth()) && void 0 !== n ? n : -1) + 1).padStart(2, "0"))),
                                e.abrupt("return", st);
                            case 2:
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
              , Ft = function() {
                var e = (0,
                s.Z)(d().mark((function e(t) {
                    var _, n;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return _ = t ? "&entrance_date=".concat(t) : "",
                                n = null === J || void 0 === J ? void 0 : J.map((function(e) {
                                    return "ticket_ids[]=".concat(e)
                                }
                                )),
                                e.next = 4,
                                X.default().get("/api/d/events/".concat(ee, "?").concat(null === n || void 0 === n ? void 0 : n.join("&")).concat(_, "&channel=").concat(ae)).then((function(e) {
                                    ue(e.data);
                                    var t = e.data.event_schedules;
                                    if (ae !== Y.z8.fast) {
                                        var _ = (0,
                                        o.Z)(T.NT.date.custom("YYYY.MM.DD", T.d4.local(st)).split("."), 3)
                                          , n = _[0]
                                          , a = _[1]
                                          , s = _[2]
                                          , r = {}
                                          , c = {};
                                        for (var l in t) {
                                            var d = t[l];
                                            c[d.start_time] = {
                                                schedule_name: d.schedule_name,
                                                time_state: t[l].time_status,
                                                unavailable_reason: t[l].unavailable_reason
                                            }
                                        }
                                        r[s] = {
                                            date_state: 1,
                                            schedules: c
                                        },
                                        ye({
                                            year: n,
                                            month: a,
                                            event_code: ee,
                                            states: r
                                        })
                                    }
                                    if (ae === Y.z8.someday) {
                                        var u = Object.keys(t).sort((function(e, t) {
                                            return parseInt(e) - parseInt(t)
                                        }
                                        ))
                                          , m = !0
                                          , v = !1
                                          , h = void 0;
                                        try {
                                            for (var p, f = u[Symbol.iterator](); !(m = (p = f.next()).done); m = !0) {
                                                var y = p.value;
                                                if (t[y].unavailable_reason === i.RESERVABLE) {
                                                    je({
                                                        schedule_name: t[y].schedule_name,
                                                        start_time: t[y].start_time
                                                    });
                                                    break
                                                }
                                            }
                                        } catch (x) {
                                            v = !0,
                                            h = x
                                        } finally {
                                            try {
                                                m || null == f.return || f.return()
                                            } finally {
                                                if (v)
                                                    throw h
                                            }
                                        }
                                    }
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    r.Z)(e, m.AxiosError)) {
                                        var t, _ = (0,
                                        I.Yi)(e).generalError;
                                        switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                        case 404:
                                        default:
                                            R.push((0,
                                            K.A0)(R.asPath, "/"));
                                            break;
                                        case 422:
                                            "th_error" === (null === _ || void 0 === _ ? void 0 : _.name) ? V.notifySystemError("E_SW_GP_DL_114_9_422_62", null === _ || void 0 === _ ? void 0 : _.detail.th_error_code) : "fetch_remainder_failed" === (null === _ || void 0 === _ ? void 0 : _.name) ? Et(!0) : V.notifySystemError("E_SW_GP_DL_114_9_422_92")
                                        }
                                    } else
                                        V.notifySystemError("E_SW_GP_DL_114_9_999_12")
                                }
                                ));
                            case 4:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(t) {
                    return e.apply(this, arguments)
                }
            }()
              , Yt = function() {
                var e = (0,
                s.Z)(d().mark((function e(t, _) {
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2,
                                X.default().get("/api/d/schedules/".concat(t, "/").concat(_, "/").concat(ee)).then((function(e) {
                                    ye(e.data)
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    r.Z)(e, m.AxiosError)) {
                                        var t, _ = (0,
                                        I.Yi)(e).generalError;
                                        switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                        case 404:
                                            R.push((0,
                                            K.A0)(R.asPath, "/"));
                                            break;
                                        case 422:
                                            "th_error" === (null === _ || void 0 === _ ? void 0 : _.name) ? V.notifySystemError("E_SW_GP_DL_114_9_422_63", null === _ || void 0 === _ ? void 0 : _.detail.th_error_code) : V.notifySystemError("E_SW_GP_DL_114_9_422_93");
                                            break;
                                        default:
                                            V.notifySystemError("E_SW_GP_DL_114_9_900_13")
                                        }
                                    } else
                                        V.notifySystemError("E_SW_GP_DL_114_9_999_13")
                                }
                                ));
                            case 2:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(t, _) {
                    return e.apply(this, arguments)
                }
            }()
              , qt = (0,
            p.useCallback)((function(e) {
                e.preventDefault();
                var t = ie ? "&type=change" : ""
                  , _ = "";
                R.query.event_type && (_ = "&event_type=".concat(R.query.event_type));
                var n = st ? "&entrance_date=".concat(st) : ""
                  , a = "?id=".concat(R.query.id).concat(n, "&event_id=").concat(R.query.event_id, "&screen_id=").concat(te, "&priority=").concat(ne, "&lottery=").concat(ae).concat(t, "&keyword=").concat(se).concat(_, "&reserve_id=").concat(Ee)
                  , i = (0,
                K.A0)(R.asPath, "/event_search/".concat(a));
                R.push(i)
            }
            ), [])
              , Rt = function() {
                return ae === Y.z8.fast ? "fast_lotteries" : ae === Y.z8.seven_days_ago ? "day_lotteries" : ae === Y.z8.two_month_ago ? "month_lotteries" : void 0
            }
              , Ut = function() {
                var e = (0,
                s.Z)(d().mark((function e(t) {
                    var _, n, a, i, s, o, c, l;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                if (t.preventDefault(),
                                !Ot.current) {
                                    e.next = 3;
                                    break
                                }
                                return e.abrupt("return");
                            case 3:
                                return Ot.current = !0,
                                _ = X.default(),
                                n = Rt(),
                                a = "?" + J.map((function(e) {
                                    return "ticket_ids[]=".concat(e)
                                }
                                )).join("&"),
                                i = st ? "&entrance_date=".concat(st) : "",
                                e.next = 10,
                                _.get("/api/d/".concat(n, "/pre_list").concat(a).concat(i)).catch((function(e) {
                                    if ((0,
                                    r.Z)(e, m.AxiosError)) {
                                        var t, _ = (0,
                                        I.Yi)(e), n = _.generalError;
                                        _.validationErrors;
                                        switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                        case 404:
                                            V.notifySystemError("E_SW_GP_DL_114_9_404_17");
                                            break;
                                        case 409:
                                            V.notifySystemError("E_SW_GP_DL_114_9_409_17");
                                            break;
                                        case 422:
                                            "th_error" === (null === n || void 0 === n ? void 0 : n.name) ? V.notifySystemError("E_SW_GP_DL_114_9_422_67", null === n || void 0 === n ? void 0 : n.detail.th_error_code) : V.notifySystemError("E_SW_GP_DL_114_9_422_97");
                                            break;
                                        default:
                                            V.notifySystemError("E_SW_GP_DL_114_9_900_17")
                                        }
                                    } else
                                        V.notifySystemError("E_SW_GP_DL_114_9_999_17")
                                }
                                ));
                            case 10:
                                return s = e.sent,
                                "undefined" === (null === s || void 0 === s ? void 0 : s.data.list) || 0 === (null === s || void 0 === s ? void 0 : s.data.list.length) ? (o = "post",
                                c = "/api/d/".concat(n),
                                l = {
                                    ticket_ids: J,
                                    event_code_1: null === de || void 0 === de ? void 0 : de.event_code,
                                    start_time_1: null === kt || void 0 === kt ? void 0 : kt.time
                                },
                                ae === Y.z8.fast ? l.entrance_date_1 = st : l.entrance_date = st) : (o = "put",
                                l = {
                                    ticket_ids: J
                                },
                                null === s || void 0 === s || s.data.list.forEach((function(e) {
                                    var t = e.priority
                                      , _ = "event_code_".concat(t)
                                      , n = "start_time_".concat(t);
                                    if (l[_] = e.event_code,
                                    l[n] = e.start_time,
                                    ae === Y.z8.fast) {
                                        var a = "entrance_date_".concat(t);
                                        l[a] = e.entrance_date
                                    }
                                }
                                )),
                                l["event_code_".concat(ne)] = ee,
                                l["start_time_".concat(ne)] = null === kt || void 0 === kt ? void 0 : kt.time,
                                l.lock_version = null === s || void 0 === s ? void 0 : s.data.lock_version,
                                ae === Y.z8.fast ? l["entrance_date_".concat(ne)] = st : l.entrance_date = st,
                                c = "/api/d/".concat(n, "/").concat(null === s || void 0 === s ? void 0 : s.data.list[0].id)),
                                e.prev = 16,
                                e.next = 19,
                                _[o](c, l);
                            case 19:
                                e.sent,
                                we({
                                    eventDate: (0,
                                    A.xS)({
                                        time: !1,
                                        day: !0
                                    }).local(T.d4.local(st)),
                                    eventName: de ? de.event_name : "",
                                    time: kt ? kt.time : "",
                                    scheduleName: kt ? kt.name : ""
                                }),
                                Le(!0),
                                e.next = 27;
                                break;
                            case 24:
                                e.prev = 24,
                                e.t0 = e.catch(16),
                                ze(!0);
                            case 27:
                                Ot.current = !1;
                            case 28:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e, null, [[16, 24]])
                }
                )));
                return function(t) {
                    return e.apply(this, arguments)
                }
            }()
              , Bt = function() {
                return ae === Y.z8.empty || ae === Y.z8.someday ? ae : ""
            }
              , Kt = function() {
                var e = (0,
                s.Z)(d().mark((function e(t) {
                    var _, n = arguments;
                    return d().wrap((function(e) {
                        for (; ; )
                            switch (e.prev = e.next) {
                            case 0:
                                if (_ = n.length > 1 && void 0 !== n[1] && n[1],
                                !Zt.current) {
                                    e.next = 3;
                                    break
                                }
                                return e.abrupt("return");
                            case 3:
                                return Zt.current = !0,
                                e.next = 6,
                                X.default().post("/api/d/user_event_reservations", {
                                    ticket_ids: J,
                                    entrance_date: st,
                                    start_time: t,
                                    event_code: ee,
                                    registered_channel: Bt()
                                }).then((function(e) {
                                    we(_ ? {
                                        eventDate: (0,
                                        A.xS)({
                                            time: !1,
                                            day: !0
                                        }).local(T.d4.local(st)),
                                        eventName: de ? de.event_name : "",
                                        time: null === be || void 0 === be ? void 0 : be.start_time,
                                        scheduleName: null === be || void 0 === be ? void 0 : be.schedule_name
                                    } : {
                                        eventDate: (0,
                                        A.xS)({
                                            time: !1,
                                            day: !0
                                        }).local(T.d4.local(st)),
                                        eventName: de ? de.event_name : "",
                                        time: kt ? kt.time : "",
                                        scheduleName: kt ? kt.name : ""
                                    }),
                                    Le(!0)
                                }
                                )).catch((function(e) {
                                    if ((0,
                                    r.Z)(e, m.AxiosError)) {
                                        var t, _ = (0,
                                        I.Yi)(e), n = _.generalError;
                                        _.validationErrors;
                                        switch (null === (t = e.response) || void 0 === t ? void 0 : t.status) {
                                        case 422:
                                            if ("on_the_day_exist" === (null === n || void 0 === n ? void 0 : n.name)) {
                                                Ie(!0);
                                                break
                                            }
                                            if ("th_error" === (null === n || void 0 === n ? void 0 : n.name)) {
                                                V.notifySystemError("E_SW_GP_DL_114_9_422_64", null === n || void 0 === n ? void 0 : n.detail.th_error_code);
                                                break
                                            }
                                            if ((0,
                                            I.kB)(e.response)) {
                                                var a, i = null === (a = e.response) || void 0 === a ? void 0 : a.data;
                                                return Xe(i),
                                                void Be(!0)
                                            }
                                            Ae(!0),
                                            ze(!0);
                                            break;
                                        default:
                                            V.notifySystemError("E_SW_GP_DL_114_9_900_14")
                                        }
                                    } else
                                        V.notifySystemError("E_SW_GP_DL_114_9_999_14")
                                }
                                ));
                            case 6:
                                Zt.current = !1;
                            case 7:
                            case "end":
                                return e.stop()
                            }
                    }
                    ), e)
                }
                )));
                return function(t) {
                    return e.apply(this, arguments)
                }
            }()
              , Vt = (0,
            p.useCallback)((function() {
                return ae === Y.z8.fast ? "SW_GP_DL_114_0005" : ae === Y.z8.seven_days_ago ? "SW_GP_DL_124_0040" : ae === Y.z8.two_month_ago ? "SW_GP_DL_124_0039" : ae === Y.z8.someday ? "SW_GP_DL_124_0042" : ae === Y.z8.empty ? "SW_GP_DL_124_0041" : void 0
            }
            ), [])
              , Xt = (0,
            p.useCallback)((function() {
                return ae === Y.z8.fast ? w.w.early_booking : ae === Y.z8.seven_days_ago ? w.w.seven_days_ago : ae === Y.z8.two_month_ago ? w.w.two_month_ago : ae === Y.z8.someday ? w.w.same_day : w.w.empty
            }
            ), [])
              , Ht = ae === Y.z8.fast
              , Qt = function(e, t) {
                return Ht ? e : t
            }
              , $t = function(e, t) {
                var _ = Ye.some((function(t) {
                    return t.entranceDate === st && t.startTime === e && t.eventCode === ee
                }
                ));
                return {
                    time: e,
                    name: t.schedules[e].schedule_name,
                    icon: "",
                    alt: "",
                    disabled: _,
                    disabledMessageCode: _ ? "SW_GP_DL_114_0054" : ""
                }
            }
              , Jt = function(e, t, _) {
                var n = __(t.schedules[e].unavailable_reason);
                if (!n.disabled) {
                    var a = _.some((function(t) {
                        return t.entranceDate === st && t.startTime === e && t.eventCode === ee
                    }
                    ));
                    n.disabled = a,
                    n.disabledMessageCode = a ? "SW_GP_DL_124_0054" : ""
                }
                return {
                    time: e,
                    name: t.schedules[e].schedule_name,
                    icon: "",
                    alt: "",
                    disabled: n.disabled,
                    disabledMessageCode: n.disabledMessageCode
                }
            }
              , e_ = function(e, t) {
                var _ = t_("".concat(t.schedules[e].time_state))
                  , n = __(t.schedules[e].unavailable_reason);
                return {
                    time: e,
                    name: t.schedules[e].schedule_name,
                    icon: _.icon,
                    alt: _.alt,
                    disabled: n.disabled,
                    disabledMessageCode: n.disabledMessageCode
                }
            }
              , t_ = function(e) {
                switch (e) {
                case a.OK:
                    return {
                        icon: "/asset/img/calendar_ok.svg",
                        alt: (0,
                        q.G)(Q, "SW_GP_DL_124_0014")
                    };
                case a.FEW:
                    return {
                        icon: "/asset/img/calendar_few.svg",
                        alt: (0,
                        q.G)(Q, "SW_GP_DL_124_0015")
                    };
                case a.NG:
                    return {
                        icon: "/asset/img/ico_ng.svg",
                        alt: (0,
                        q.G)(Q, "SW_GP_DL_124_0016")
                    };
                default:
                    return {
                        icon: "/asset/img/ico_ng.svg",
                        alt: ""
                    }
                }
            }
              , __ = function(e) {
                switch (e) {
                case i.RESERVABLE:
                    return {
                        disabled: !1,
                        disabledMessageCode: ""
                    };
                case i.STOCK_NONE:
                    return {
                        disabled: !0,
                        disabledMessageCode: ""
                    };
                case i.STOCK_NOT_ENOUGH:
                    return {
                        disabled: !0,
                        disabledMessageCode: "SW_GP_DL_124_0050"
                    };
                case i.ADMISSION_BUFFER:
                    return {
                        disabled: !0,
                        disabledMessageCode: "SW_GP_DL_124_0052"
                    };
                case i.ADMISSION_BEFORE:
                    return {
                        disabled: !0,
                        disabledMessageCode: "SW_GP_DL_124_0053"
                    };
                case i.EVENT_BUFFER:
                    return {
                        disabled: !0,
                        disabledMessageCode: "SW_GP_DL_124_0051"
                    };
                default:
                    return {
                        disabled: !0,
                        disabledMessageCode: ""
                    }
                }
            };
            (0,
            p.useEffect)((function() {
                if (!oe && st) {
                    var e = T.NT.date.custom("DD", T.d4.local(st))
                      , t = null === fe || void 0 === fe ? void 0 : fe.states[e];
                    if (t) {
                        var _ = [];
                        for (var n in t.schedules)
                            switch (ae) {
                            case Y.z8.fast:
                                _.push($t(n, t));
                                break;
                            case Y.z8.two_month_ago:
                            case Y.z8.seven_days_ago:
                                _.push(Jt(n, t, Ye));
                                break;
                            case Y.z8.empty:
                            case Y.z8.someday:
                                _.push(e_(n, t))
                            }
                        _.sort((function(e, t) {
                            return e.time > t.time ? 1 : -1
                        }
                        )),
                        lt(_)
                    }
                }
            }
            ), [st, fe, Ye]),
            (0,
            p.useEffect)((function() {
                mt((0,
                c.Z)(new Set(ct.filter((function(e) {
                    return !e.disabled
                }
                )).map((function(e) {
                    return e.time.substring(0, 2)
                }
                )))).map((function(e) {
                    return {
                        time: e
                    }
                }
                ))),
                pt(ct.filter((function(e) {
                    return !nt || 0 === e.time.indexOf(nt)
                }
                )).every((function(e) {
                    return e.disabled
                }
                ))),
                xt(ct.filter((function(e) {
                    return !nt || 0 === e.time.indexOf(nt)
                }
                )))
            }
            ), [ct, nt]),
            (0,
            p.useEffect)((function() {
                wt("filter_".concat(Math.round(Math.random() * Math.pow(10, 16)).toString(32)))
            }
            ), []);
            var n_ = ae === Y.z8.fast && _e.includes(O.n.myticket)
              , a_ = {
                all: (0,
                F.o)((0,
                q.G)(Q, "SW_GP_DL_114_0055")),
                span: (0,
                F.o)((0,
                q.G)(Q, "SW_GP_DL_114_0056"))
            };
            return oe ? (0,
            u.jsx)(b.Z, {
                height: "200px"
            }) : (0,
            u.jsxs)(u.Fragment, {
                children: [(0,
                u.jsx)(G.Z, {
                    active: 2,
                    messages: Ht ? ["SW_GP_DL_114_0002", "SW_GP_DL_114_0003", "SW_GP_DL_114_0004"] : ["SW_GP_DL_124_0002", "SW_GP_DL_124_0003", "SW_GP_DL_124_0004"]
                }), (0,
                u.jsxs)("div", {
                    className: x().main,
                    children: [(0,
                    u.jsxs)("h1", {
                        className: x().title,
                        children: [(0,
                        u.jsx)("span", {
                            className: x().caption,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: Vt(),
                                symbolicDecoration: "brackets"
                            })
                        }), (0,
                        u.jsx)(j.Z, {
                            messageCode: Qt("SW_GP_DL_114_1005", "SW_GP_DL_124_0005")
                        })]
                    }), !n_ && (0,
                    u.jsx)("div", {
                        className: x().info,
                        children: (0,
                        u.jsxs)("div", {
                            children: [!_e.includes(O.n.myticket) && (0,
                            u.jsxs)("div", {
                                className: x().ticket_count,
                                children: [(0,
                                u.jsx)(j.Z, {
                                    messageCode: "CMN_SW_GP_DL_113_0001"
                                }), " ", J.length, (0,
                                u.jsx)(j.Z, {
                                    messageCode: "CMN_SW_GP_DL_113_0003"
                                })]
                            }), (ae === Y.z8.seven_days_ago || ae === Y.z8.two_month_ago || ae === Y.z8.someday || ae === Y.z8.empty) && (0,
                            u.jsxs)(u.Fragment, {
                                children: [(0,
                                u.jsx)(j.Z, {
                                    messageCode: Qt("SW_GP_DL_114_0006", "SW_GP_DL_124_0006")
                                }), "\uff1a", (0,
                                A.xS)({
                                    time: !1,
                                    day: !0
                                }).local(T.d4.local(st)), Ct && (0,
                                u.jsx)(D.U, {
                                    ticketIds: J,
                                    entranceDate: st
                                })]
                            })]
                        })
                    }), (0,
                    u.jsxs)("div", {
                        className: x().search,
                        children: [(0,
                        u.jsx)("h2", {
                            className: x().title,
                            children: null === de || void 0 === de ? void 0 : de.event_name
                        }), (null === de || void 0 === de ? void 0 : de.thumbnail_image_path) && (0,
                        u.jsx)("img", {
                            src: de.thumbnail_image_path,
                            alt: "",
                            className: x().main_img
                        })]
                    }), (0,
                    u.jsxs)("div", {
                        className: x().form_result,
                        children: [(0,
                        u.jsx)("h3", {
                            className: x().sub_title,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: Qt("SW_GP_DL_114_0008", "SW_GP_DL_124_0008")
                            })
                        }), (0,
                        u.jsx)("p", {
                            className: x().description,
                            children: null === de || void 0 === de ? void 0 : de.event_summary
                        }), (0,
                        u.jsxs)("div", {
                            className: x().event_chip_links,
                            children: [(null === de || void 0 === de ? void 0 : de.portal_url) && (null === de || void 0 === de ? void 0 : de.portal_url_desc) && (0,
                            u.jsx)("div", {
                                className: x().virtual_link,
                                children: (0,
                                u.jsx)("a", {
                                    href: de.portal_url,
                                    className: [x().external_link, "pill-btn"].join(" "),
                                    target: "_blank",
                                    rel: "noreferrer",
                                    children: (0,
                                    u.jsxs)("div", {
                                        className: x().chip,
                                        children: [null === de || void 0 === de ? void 0 : de.portal_url_desc, "\xa0", (0,
                                        u.jsx)("img", {
                                            src: "/asset/img/ico_external.svg",
                                            alt: (0,
                                            q.G)(Q, "SW_GP_DL_001_0904"),
                                            className: x().external_link_icon
                                        })]
                                    })
                                })
                            }), (null === de || void 0 === de ? void 0 : de.virtual_url) && (null === de || void 0 === de ? void 0 : de.virtual_url_desc) && (0,
                            u.jsx)("div", {
                                className: x().virtual_link,
                                children: (0,
                                u.jsx)("a", {
                                    href: de.virtual_url,
                                    className: [x().external_link, "pill-btn"].join(" "),
                                    target: "_blank",
                                    rel: "noreferrer",
                                    children: (0,
                                    u.jsxs)("div", {
                                        className: x().chip,
                                        children: [null === de || void 0 === de ? void 0 : de.virtual_url_desc, "\xa0", (0,
                                        u.jsx)("img", {
                                            src: "/asset/img/ico_external.svg",
                                            alt: (0,
                                            q.G)(Q, "SW_GP_DL_001_0904"),
                                            className: x().external_link_icon
                                        })]
                                    })
                                })
                            })]
                        }), ae === Y.z8.fast && (0,
                        u.jsxs)(u.Fragment, {
                            children: [(0,
                            u.jsx)("h3", {
                                className: x().form_result_caption,
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: "SW_GP_DL_114_0009"
                                })
                            }), (0,
                            u.jsx)(j.Z, {
                                is: "p",
                                className: x().note,
                                messageCode: "SW_GP_DL_114_0204"
                            }), (0,
                            u.jsx)("div", {
                                className: x().search_result_block,
                                children: et ? (0,
                                u.jsx)(P.f, {
                                    schedules: fe,
                                    fixedIcon: !0,
                                    loading: ve === n.loading,
                                    updateSelectedDate: function(e) {
                                        rt(e.replace(/-/g, "")),
                                        St(void 0)
                                    },
                                    updateSchedules: function() {
                                        var e = (0,
                                        s.Z)(d().mark((function e(t) {
                                            var _, a, i;
                                            return d().wrap((function(e) {
                                                for (; ; )
                                                    switch (e.prev = e.next) {
                                                    case 0:
                                                        return _ = (0,
                                                        o.Z)(T.NT.date.custom("YYYY,MM", t).split(","), 2),
                                                        a = _[0],
                                                        i = _[1],
                                                        he(n.loading),
                                                        e.next = 4,
                                                        Yt(a, i).then((function() {
                                                            he(n.complete)
                                                        }
                                                        ));
                                                    case 4:
                                                    case "end":
                                                        return e.stop()
                                                    }
                                            }
                                            ), e)
                                        }
                                        )));
                                        return function(t) {
                                            return e.apply(this, arguments)
                                        }
                                    }(),
                                    screenId: O.n.eventTime,
                                    initialDate: R.query.entrance_date ? R.query.entrance_date : "",
                                    initialYearMonth: Qe,
                                    scheduleRange: et
                                }) : (0,
                                u.jsx)(b.Z, {})
                            })]
                        }), ae === Y.z8.someday && 1 === (null === de || void 0 === de ? void 0 : de.reserve_now) && (0,
                        u.jsxs)(u.Fragment, {
                            children: [(0,
                            u.jsx)("h3", {
                                className: x().form_result_caption,
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: "SW_GP_DL_124_0044"
                                })
                            }), (0,
                            u.jsxs)("div", {
                                className: x().book_now,
                                children: [(0,
                                u.jsx)("div", {
                                    className: x().book_now__guide,
                                    children: (0,
                                    u.jsx)(j.Z, {
                                        messageCode: "SW_GP_DL_124_0045"
                                    })
                                }), (0,
                                u.jsxs)("div", {
                                    className: x().book_now__wrap,
                                    children: [(0,
                                    u.jsx)("div", {
                                        className: x().book_now__wrap__guide,
                                        children: (0,
                                        u.jsx)(j.Z, {
                                            messageCode: "SW_GP_DL_124_0046"
                                        })
                                    }), (0,
                                    u.jsx)("div", {
                                        className: x().book_now__wrap__time,
                                        children: be ? (0,
                                        u.jsx)(u.Fragment, {
                                            children: be.schedule_name
                                        }) : (0,
                                        u.jsx)(u.Fragment, {
                                            children: (0,
                                            u.jsx)(j.Z, {
                                                messageCode: "SW_GP_DL_124_0049"
                                            })
                                        })
                                    }), (0,
                                    u.jsx)("div", {
                                        className: x().book_now__wrap__button,
                                        children: (0,
                                        u.jsx)("button", {
                                            className: x().book_now_button,
                                            disabled: !be,
                                            onClick: function() {
                                                return Kt(null === be || void 0 === be ? void 0 : be.start_time, !0)
                                            },
                                            onKeyUp: function(e) {
                                                return (0,
                                                M.x)(e, (function() {
                                                    return Kt(null === be || void 0 === be ? void 0 : be.start_time, !0)
                                                }
                                                ))
                                            },
                                            tabIndex: H.focusability.main ? 0 : -1,
                                            children: (0,
                                            u.jsx)(j.Z, {
                                                messageCode: "SW_GP_DL_124_0047"
                                            })
                                        })
                                    })]
                                })]
                            }), (0,
                            u.jsx)("div", {
                                className: x().book_now_other,
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: "SW_GP_DL_124_0048"
                                })
                            })]
                        }), (0,
                        u.jsx)("h3", {
                            className: x().form_result_caption,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: Qt("SW_GP_DL_114_0023", "SW_GP_DL_124_0009")
                            })
                        }), (0,
                        u.jsx)("div", {
                            className: x().form_select_time,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: Qt("SW_GP_DL_114_0205", "SW_GP_DL_114_0205")
                            })
                        }), (ae === Y.z8.fast && !!st || ae !== Y.z8.fast) && (0,
                        u.jsxs)("div", {
                            className: x().hour_unit_wrap,
                            children: [(0,
                            u.jsx)("img", {
                                src: "/asset/img/ico_filter.svg",
                                alt: ""
                            }), (0,
                            u.jsx)("label", {
                                htmlFor: Pt,
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: "SW_GP_DL_124_0061"
                                })
                            }), (0,
                            u.jsxs)("select", {
                                id: Pt,
                                className: x().hour_unit,
                                defaultValue: "",
                                onChange: function(e) {
                                    at(e.target.value),
                                    St(void 0)
                                },
                                children: [(0,
                                u.jsx)("option", {
                                    value: "",
                                    children: a_.all
                                }), ut.map((function(e) {
                                    return (0,
                                    u.jsx)("option", {
                                        value: e.time,
                                        children: "".concat(e.time).concat(a_.span)
                                    }, e.time)
                                }
                                ))]
                            })]
                        }), (0,
                        u.jsx)("div", {
                            className: x().search_result_block,
                            children: (0,
                            u.jsx)(C, {
                                data: yt,
                                value: kt ? kt.time : "",
                                onChange: function(e) {
                                    St(e)
                                }
                            })
                        }), ae !== Y.z8.someday && ae !== Y.z8.empty && (0,
                        u.jsxs)("div", {
                            className: x().lottery_description,
                            children: [(0,
                            u.jsx)("img", {
                                src: "/asset/img/ico_alert.svg",
                                alt: (0,
                                q.G)(Q, "SW_GP_DL_114_0050")
                            }), "\xa0", (0,
                            u.jsx)(j.Z, {
                                messageCode: "SW_GP_DL_114_0051"
                            })]
                        }), (ae === Y.z8.someday || ae === Y.z8.empty) && (0,
                        u.jsx)("table", {
                            className: x().scale,
                            children: (0,
                            u.jsx)("tbody", {
                                children: (0,
                                u.jsxs)("tr", {
                                    children: [(0,
                                    u.jsx)("th", {
                                        children: (0,
                                        u.jsx)("div", {
                                            className: x().scale_inner_cell,
                                            children: (0,
                                            u.jsx)(j.Z, {
                                                messageCode: "SW_GP_DL_124_0013"
                                            })
                                        })
                                    }), (0,
                                    u.jsxs)("td", {
                                        children: [(0,
                                        u.jsx)("img", {
                                            src: "/asset/img/calendar_ok.svg",
                                            alt: (0,
                                            F.o)((0,
                                            q.G)(Q, "SW_GP_DL_124_0014"))
                                        }), (0,
                                        u.jsx)(j.Z, {
                                            is: "p",
                                            className: x().scale_text,
                                            messageCode: Qt("SW_GP_DL_114_0020", "SW_GP_DL_124_0014")
                                        })]
                                    }), (0,
                                    u.jsxs)("td", {
                                        children: [(0,
                                        u.jsx)("img", {
                                            src: "/asset/img/calendar_few.svg",
                                            alt: (0,
                                            F.o)((0,
                                            q.G)(Q, "SW_GP_DL_124_0015"))
                                        }), (0,
                                        u.jsx)(j.Z, {
                                            is: "p",
                                            className: x().scale_text,
                                            messageCode: Qt("SW_GP_DL_114_0021", "SW_GP_DL_124_0015")
                                        })]
                                    }), (0,
                                    u.jsxs)("td", {
                                        children: [(0,
                                        u.jsx)("img", {
                                            src: "/asset/img/ico_ng.svg",
                                            alt: (0,
                                            F.o)((0,
                                            q.G)(Q, "SW_GP_DL_124_0016"))
                                        }), (0,
                                        u.jsx)(j.Z, {
                                            is: "p",
                                            className: x().scale_text,
                                            messageCode: "SW_GP_DL_124_0016"
                                        })]
                                    })]
                                })
                            })
                        }), ae === Y.z8.fast ? (0,
                        u.jsx)(u.Fragment, {
                            children: st && (0,
                            u.jsxs)("div", {
                                className: x().reservation,
                                children: [(0,
                                u.jsxs)("p", {
                                    children: [(0,
                                    u.jsx)(j.Z, {
                                        messageCode: "SW_GP_DL_114_0203"
                                    }), "\uff1a\xa0", (0,
                                    A.xS)({
                                        time: !1,
                                        day: !0
                                    }).local(T.d4.local(st))]
                                }), (0,
                                u.jsxs)("p", {
                                    children: [null === de || void 0 === de ? void 0 : de.event_name, "\u3000", null === kt || void 0 === kt ? void 0 : kt.name]
                                }), _e.includes(O.n.ticketSelection) && (0,
                                u.jsxs)("p", {
                                    children: [" ", (0,
                                    u.jsx)(j.Z, {
                                        messageCode: "CMN_SW_GP_DL_113_0001"
                                    }), J.length, (0,
                                    u.jsx)(j.Z, {
                                        messageCode: Qt("CMN_SW_GP_DL_113_0003", "SW_GP_DL_124_0043")
                                    })]
                                }), ht ? (0,
                                u.jsx)("p", {
                                    children: (0,
                                    u.jsx)(j.Z, {
                                        messageCode: "CMN_0021_0020"
                                    })
                                }) : (0,
                                u.jsx)(u.Fragment, {
                                    children: !kt && (0,
                                    u.jsx)("p", {
                                        children: (0,
                                        u.jsx)(j.Z, {
                                            messageCode: "CMN_0021_0010"
                                        })
                                    })
                                })]
                            })
                        }) : (0,
                        u.jsxs)("div", {
                            className: x().reservation,
                            children: [(0,
                            u.jsxs)("p", {
                                children: [null === de || void 0 === de ? void 0 : de.event_name, "\u3000"]
                            }), ht ? (0,
                            u.jsx)("p", {
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: "CMN_0021_0020"
                                })
                            }) : (0,
                            u.jsx)(u.Fragment, {
                                children: kt ? (0,
                                u.jsx)("p", {
                                    children: null === kt || void 0 === kt ? void 0 : kt.name
                                }) : (0,
                                u.jsx)("p", {
                                    children: (0,
                                    u.jsx)(j.Z, {
                                        messageCode: "CMN_0021_0010"
                                    })
                                })
                            })]
                        }), (0,
                        u.jsxs)("div", {
                            children: [(ae === Y.z8.someday || ae === Y.z8.empty) && (0,
                            u.jsx)("button", {
                                disabled: !st || !kt,
                                className: "basic-btn type2 ".concat(x().reservation_next_link),
                                onClick: function() {
                                    return Kt(null === kt || void 0 === kt ? void 0 : kt.time)
                                },
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: Qt("SW_GP_DL_114_0052", "SW_GP_DL_124_0018")
                                })
                            }), (ae === Y.z8.fast || ae === Y.z8.seven_days_ago || ae === Y.z8.two_month_ago) && (0,
                            u.jsx)("button", {
                                disabled: !st || !kt,
                                className: "basic-btn type2 ".concat(x().reservation_next_link),
                                onClick: Ut,
                                children: (0,
                                u.jsx)(j.Z, {
                                    messageCode: Qt("SW_GP_DL_114_0045", "SW_GP_DL_124_0010")
                                })
                            })]
                        })]
                    }), (0,
                    u.jsx)("div", {
                        className: x().footer,
                        children: (0,
                        u.jsx)("a", {
                            className: "basic-btn type3 ".concat(x().back_btn),
                            onClick: qt,
                            children: (0,
                            u.jsx)(j.Z, {
                                messageCode: Qt("SW_GP_DL_114_0046", "SW_GP_DL_124_0011")
                            })
                        })
                    }), (0,
                    u.jsx)(w.Z, {
                        isOpen: Ge,
                        toggleIsOpen: function() {
                            if (Ge) {
                                if (ae === Y.z8.fast || ae === Y.z8.seven_days_ago || ae === Y.z8.two_month_ago) {
                                    var e, t = "?id=".concat($, "&screen_id=").concat(te, "&reserve_id=").concat(Ee, "&entrance_date=").concat(st);
                                    e = ae === Y.z8.fast ? "/lotteries_fast_list" : ae === Y.z8.seven_days_ago ? "/lotteries_day_list" : "/lotteries_month_list";
                                    var _ = (0,
                                    K.A0)(R.asPath, "".concat(e).concat(t));
                                    return void R.push(_)
                                }
                                var n = ""
                                  , a = J.join(",");
                                _e.includes(O.n.myticket) ? n = "/myticket_detail/?id=".concat(a, "&reserve_id=").concat(Ee) : _e.includes(O.n.ticketSelection) && (n = "/myticket");
                                var i = (0,
                                K.A0)(R.asPath, n);
                                R.push(i)
                            }
                            Le(!Ge)
                        },
                        modalType: Xt(),
                        isAllEntry: 5 === Ye.length,
                        eventInfo: Pe,
                        subTitle: Vt(),
                        annotation: Qt("SW_GP_DL_114_0028", "SW_GP_DL_124_0023"),
                        onMoveScheduleSelect: function() {
                            new U(ne).increment(),
                            Tt(st).then((function(e) {
                                var t, _ = e.map((function(e) {
                                    return e.priority
                                }
                                )).reduce((function(e, t) {
                                    return Math.max(e, t)
                                }
                                ));
                                _ >= 1 && _ < 5 ? t = _ + 1 : (console.error("out-of-scope priority"),
                                t = 5);
                                var n = ie ? "&type=change" : ""
                                  , a = R.query.event_type ? "&event_type=".concat(R.query.event_type) : ""
                                  , i = "/event_time/?id=".concat($, "&event_id=").concat(ee, "&screen_id=").concat(te, "&priority=").concat(t, "&lottery=").concat(ae).concat(n, "&keyword=").concat(se).concat(a, "&reserve_id=").concat(Ee, "&entrance_date=").concat(st)
                                  , s = (0,
                                K.A0)(R.asPath, i);
                                location.href = s
                            }
                            ))
                        },
                        onMoveEventSelect: function() {
                            var e = ae === Y.z8.fast ? "lotteries_fast_list" : ae === Y.z8.seven_days_ago ? "lotteries_day_list" : ae === Y.z8.two_month_ago ? "lotteries_month_list" : ae === Y.z8.someday || ae === Y.z8.empty ? _e.includes(O.n.myticket) ? "CMN_SW_GP_DL_113_0010" : "CMN_SW_GP_DL_113_0011" : void 0
                              , t = ie ? "&type=change" : ""
                              , _ = (0,
                            K.A0)(R.asPath, "/".concat(e, "/?id=").concat($, "&screen_id=").concat(te).concat(t, "&reserve_id=").concat(Ee, "&entrance_date=").concat(st));
                            R.push(_)
                        }
                    }), (0,
                    u.jsx)(w.Z, {
                        isOpen: Te,
                        toggleIsOpen: function() {
                            Ie(!Te)
                        },
                        modalType: w.w.onTheDayExistFailed,
                        subTitle: Vt()
                    }), (0,
                    u.jsx)(w.Z, {
                        isOpen: Ce,
                        toggleIsOpen: function() {
                            ze(!Ce),
                            Oe && R.reload()
                        },
                        modalType: w.w.failed,
                        subTitle: Vt(),
                        annotation: Qt("SW_GP_DL_114_0043", "SW_GP_DL_124_0036")
                    }), (At || Mt) && (0,
                    u.jsx)(N.C, {
                        lottery: ae,
                        screenId: te,
                        schedule: ge,
                        ticketIds: J
                    }), (0,
                    u.jsx)(E.f, {
                        isOpen: Ue,
                        toggleIsOpen: function() {
                            if (_e.includes(O.n.myticket)) {
                                var e = _e.filter((function(e) {
                                    return e !== O.n.myticket
                                }
                                )).join(",");
                                R.push((0,
                                K.A0)(R.asPath, "/myticket_detail/?screen_id=".concat(e, "&id=").concat(J[0], "&reserve_id=").concat(Ee)))
                            } else
                                R.push((0,
                                K.A0)(R.asPath, "/ticket_selection/?screen_id=".concat(R.query.screen_id, "&lottery=").concat(ae, "&id=").concat(R.query.id)))
                        },
                        validateError: Ve,
                        showDetail: !0
                    }), (0,
                    u.jsx)(Z.Q, {
                        isOpen: jt,
                        lottery: ae,
                        reserveId: Ee,
                        screenIds: _e,
                        ticketId: $,
                        ticketIds: J
                    }), (0,
                    u.jsx)(z.T, {
                        isOpen: Gt,
                        toggleIsOpen: function() {
                            (0,
                            g.P)({
                                customError: {
                                    message: "Unauthorized URL access",
                                    config: {
                                        url: window.location.href
                                    }
                                },
                                sub: ""
                            }),
                            (0,
                            v.deleteCookie)("partner_code"),
                            (0,
                            v.deleteCookie)("is_use_promotion_code"),
                            (0,
                            v.deleteCookie)("is_use_municipality_code");
                            var e = (0,
                            K.bw)(R.asPath)
                              , t = (e ? [["lang", e]] : []).map((function(e) {
                                return e.join("=")
                            }
                            )).join("&")
                              , _ = t ? "?".concat(t) : "";
                            window.location.href = "/api/d/expo_logout/".concat(_)
                        },
                        screenId: O.n.eventTime
                    })]
                })]
            })
        }
    },
    3282: function(e) {
        e.exports = {
            time_picker: "style_time_picker__PtKz3",
            time_picker__wrap: "style_time_picker__wrap__UBImr",
            time_picker__row: "style_time_picker__row__UFbsp",
            time_picker__inner: "style_time_picker__inner__Lpx2U",
            time_picker__selected: "style_time_picker__selected__rXBlf",
            time_picker__icon_area: "style_time_picker__icon_area__uw9mh",
            time_picker__radio: "style_time_picker__radio__1c6YB",
            time_picker__disabled: "style_time_picker__disabled___yvRh",
            time_picker__error: "style_time_picker__error__OjHpk"
        }
    },
    32255: function(e) {
        e.exports = {
            main_contents: "style_main_contents__An0lA",
            content_block: "style_content_block__mgiOl",
            common_text: "style_common_text__cmdiA",
            common_text_border_and_icon: "style_common_text_border_and_icon__Lx_Av",
            common_text_border: "style_common_text_border__16cjo",
            link_main_title: "style_link_main_title__PG4Xu",
            link_big_title: "style_link_big_title__Lm2Ct",
            link_little_title: "style_link_little_title__ShDxB",
            border_line: "style_border_line__UX3C7",
            link_text: "style_link_text__3oQSt",
            text_with_caution: "style_text_with_caution__6_UT5",
            caution_mark: "style_caution_mark__eEtq1",
            link_a_wrapper: "style_link_a_wrapper__uYm1z",
            link_big_button: "style_link_big_button__tag8d",
            link_buttons: "style_link_buttons__9OjLz",
            link_little_button: "style_link_little_button__AAzFs",
            link_little_button_disabled: "style_link_little_button_disabled__KjUL_",
            link_little_button_black: "style_link_little_button_black__u8goG",
            link_icon: "style_link_icon__sZTF9",
            link_icon_before: "style_link_icon_before__sjhsM",
            caution_text: "style_caution_text__Mz_tK",
            invoice_note: "style_invoice_note__utry_",
            invoice_notation: "style_invoice_notation__ZREDX",
            invoice_notation__incorporated: "style_invoice_notation__incorporated__tL_2h",
            invoice_notation__registration: "style_invoice_notation__registration__ISd41",
            invoice_notation__term: "style_invoice_notation__term__2lHxo",
            main: "style_main__7Ynlc",
            footer: "style_footer__Yk1Yp",
            search: "style_search__qm_g_",
            search_caption: "style_search_caption__hNzNg",
            search_btn: "style_search_btn__vIBYv",
            main_img: "style_main_img__W_6pm",
            caption: "style_caption__riP_k",
            title: "style_title__44y_b",
            sub_title: "style_sub_title__bDw9W",
            info: "style_info__DjEiR",
            description: "style_description__o9igj",
            search_text: "style_search_text__YkLpc",
            search_form: "style_search_form__K_gsL",
            form_result: "style_form_result__maTmU",
            form_result_caption: "style_form_result_caption__iXsYT",
            form_result_empty: "style_form_result_empty__BIKc8",
            search_item_row: "style_search_item_row__N_q32",
            item_icon: "style_item_icon__tyEaU",
            search_item: "style_search_item__ur8Fj",
            search_item_note: "style_search_item_note__KT3_A",
            search_item_title: "style_search_item_title__QdeaO",
            search_result_block: "style_search_result_block__TZjEQ",
            scale: "style_scale__Wf3te",
            scale_inner_cell: "style_scale_inner_cell__FCqdZ",
            block: "style_block__0YcO7",
            chip: "style_chip__AbSyT",
            external_link: "style_external_link__w5i_Z",
            external_link_icon: "style_external_link_icon__Q9Vgv",
            reservation: "style_reservation__kIfvE",
            reservation_next_link: "style_reservation_next_link__7gOxy",
            note: "style_note__QQN9E",
            back_btn: "style_back_btn__fjnph",
            virtual_link: "style_virtual_link__Bc_AJ",
            event_chip_links: "style_event_chip_links___Pve2",
            ticket_count: "style_ticket_count__XAgSq",
            form_select_time: "style_form_select_time__TZmGY",
            hour_unit_wrap: "style_hour_unit_wrap__piAg4",
            hour_unit: "style_hour_unit__emLpN",
            lottery_description: "style_lottery_description__EzYU4",
            book_now: "style_book_now__24fCe",
            book_now__guide: "style_book_now__guide__GzHnu",
            book_now__wrap: "style_book_now__wrap__N10nZ",
            book_now__wrap__guide: "style_book_now__wrap__guide__kU_5V",
            book_now__wrap__time: "style_book_now__wrap__time__UClVd",
            book_now__wrap__button: "style_book_now__wrap__button___YtHS",
            book_now_button: "style_book_now_button__aj3PG",
            book_now_other: "style_book_now_other__PZOW8"
        }
    }
}, function(e) {
    e.O(0, [5662, 6199, 7201, 7816, 9774, 2888, 179], (function() {
        return t = 72533,
        e(e.s = t);
        var t
    }
    ));
    var t = e.O();
    _N_E = t
}
]);
