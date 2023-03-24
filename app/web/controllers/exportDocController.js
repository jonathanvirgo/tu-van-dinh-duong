var express         = require('express'),
    router          = express.Router(),
    webService      = require('./../models/webModel'),
    moment          = require('moment');

const docx = require("docx");
const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, UnderlineType, Table, TableCell, TableRow, WidthType, BorderStyle} = docx;

router.get("/examine", async (req, res) => {
    try {
        console.log("examine", JSON.parse(req.query.data), req.user);
        if (!req.user) {
            let message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(message);
            return;
        }
        let now = moment();
        let data = JSON.parse(req.query.data);
        if(data){
            let yearOld = webService.caculateYearOld(data.cus_birthday);
            console.log("date", now.year(), now.month(), now.date());
            let medicine = getMedicine(data.prescription ? JSON.parse(data.prescription) : []);
            console.log("medicine", medicine);
            const doc = new Document({
                creator: "dinhduonghotro.com",
                title: "Phiếu khám ${req.user.full_name ? req.user.full_name : req.user.name}",
                description: "Phiếu khám ${req.user.full_name ? req.user.full_name : req.user.name}",
                styles: {
                    paragraphStyles: [
                        {
                            id: "hospital",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                size: 28,
                                bold: true,
                                allCaps: true
                            }
                        },
                        {
                            id: "department",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                size: 26,
                                allCaps: true
                            },
                            paragraph: {
                                spacing: {
                                    before: 60,
                                    after: 480
                                },
                            },
                        },
                        {
                            id: "title",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                size: 26,
                                bold: true
                            },
                            paragraph: {
                                spacing: {
                                    before: 240,
                                    after: 120
                                },
                            },
                        },
                        {
                            id: "size14",
                            basedOn: "Normal",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                size: 28
                            }
                        },
                        {
                            id: "size14-bold",
                            basedOn: "size14",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                bold: true
                            }
                        },
                        {
                            id: "table_heading",
                            basedOn: "size14",
                            next: "Normal",
                            quickFormat: true,
                            run: {
                                bold: true
                            },
                            paragraph: {
                                alignment: AlignmentType.CENTER,
                                spacing: {
                                    before: 80,
                                    after: 80
                                },
                            }
                        },
                        {
                            id: "table_cell",
                            basedOn: "size14",
                            next: "Normal",
                            quickFormat: true,
                            paragraph: {
                                alignment: AlignmentType.CENTER,
                                spacing: {
                                    before: 80,
                                    after: 80
                                },
                            }
                        }
                    ],
                },
                sections: [{
                    children: [
                        new Paragraph({
                            text: req.user.hospital_name,
                            style: "hospital",
                        }),
                        new Paragraph({
                            text: req.user.department_name,
                            style: "department",
                            indent: {
                                left: 1208
                            }
                        }),
                        new Paragraph({
                            text: "PHIẾU TƯ VẤN DINH DƯỠNG",
                            alignment: AlignmentType.CENTER,
                            style: "hospital",
                            spacing:{
                                after: 480
                            }
                        }),
                        new Paragraph({
                            text: "1. THÔNG TIN CHUNG",
                            style: "title",
                        }),
                        tableName(data, yearOld),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Địa chỉ: " + (data.cus_address ? data.cus_address : '')
                                }),
                            ],
                            style: "size14"
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Chuẩn đoán: " + (data.diagnostic ? data.diagnostic : '')
                                }),
                            ],
                            style: "size14"
                        }),
                        tableLength(data),
                        tableCNTC(data),
                        new Paragraph({
                            text: "2. KHÁM LÂM SÀNG",
                            style: "title",
                        }),
                        new Paragraph({
                            text: data.clinical_examination ? data.clinical_examination : '',
                            style: "size14",
                        }),
                        new Paragraph({
                            text: "3. KẾT QUẢ XÉT NGHIỆM",
                            style: "title",
                        }),
                        tableHongCau(data),
                        tableAlbumin(data),
                        tableAst(data),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Bilirubin TP/TT: " + (data.cus_bilirubin ? data.cus_bilirubin : '')
                                })
                            ],
                            style: "size14"
                        }),
                        new Paragraph({
                            text: "4. LỜI KHUYÊN DINH DƯỠNG",
                            style: "title",
                        }),
                        tableNutritionAdvice(data),
                        new Paragraph({
                            text: "5. CHẾ ĐỘ VẬN ĐỘNG, SINH HOẠT",
                            style: "title",
                        }),
                        new Paragraph({
                            text: data.active_mode_of_living ? data.active_mode_of_living : '',
                            style: "size14",
                        }),
                        new Paragraph({
                            text: "6. BỔ SUNG",
                            style: "title",
                        }),
                        ...medicine,
                        new Paragraph({
                            text: `Hà Nội, ngày ${String(now.date()).padStart(2, '0')} tháng ${String(now.month()).padStart(2, '0')} năm ${now.year()}`,
                            alignment: AlignmentType.RIGHT,
                            style: "size14"
                        }),
                        new Paragraph({
                            text: "CÁN BỘ TƯ VẤN",
                            alignment: AlignmentType.RIGHT,
                            style: "size14-bold"
                        })
                    ],
                }],
            });    
            const b64string = await Packer.toBase64String(doc);
            let filename = "Phieu_kham_" + webService.removeVietnameseTones(req.user.full_name ? req.user.full_name : req.user.name).replaceAll(" ", "_") + "_" + String(now.date()).padStart(2, '0') + "_" + String(now.month()).padStart(2, '0') + "_" + now.year(); 
            res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.docx');
            res.send(Buffer.from(b64string, 'base64')); 
        }else{
            res.json("Thiếu dữ liệu!");
        }
    } catch (error) {
        
    }
});

function tableNutritionAdvice(data){
    const table = new Table({
        columnWidths: [2000, 2336, 2336, 2336],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 2000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Nhóm TP", style: "table_heading"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "TP nên dùng", style: "table_heading"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "TP hạn chế dùng", style: "table_heading"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "TP không nên dùng", style: "table_heading"})],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 2000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Nhóm glucid", style: "table_cell"})]
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.glucid_should_use ? data.glucid_should_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.glucid_limited_use ? data.glucid_limited_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.glucid_should_not_use ? data.glucid_should_not_use : '', style: "table_cell"})],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 2000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Nhóm protein", style: "table_cell"})]
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.protein_should_use ? data.protein_should_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.protein_limited_use ? data.protein_limited_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.protein_should_not_use ? data.protein_should_not_use : '', style: "table_cell"})],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 2000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Nhóm lipid", style: "table_cell"})]
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.lipid_should_use ? data.lipid_should_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.lipid_limited_use ? data.lipid_limited_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.lipid_should_not_use ? data.lipid_should_not_use : '', style: "table_cell"})],
                    }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({
                        width: {
                            size: 2000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Nhóm VTM & CK", style: "table_cell"})]
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.vitamin_ck_should_use ? data.vitamin_ck_should_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.vitamin_ck_limited_use ? data.vitamin_ck_limited_use : '', style: "table_cell"})],
                    }),
                    new TableCell({
                        width: {
                            size: 2336,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: data.vitamin_ck_should_not_use ? data.vitamin_ck_should_not_use : '', style: "table_cell"})],
                    }),
                ],
            }),
        ],
    });
    return table;
}

function tableName(data, yearOld){
    const table = new Table({
        columnWidths: [6500, 1500, 1010],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 6500,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Họ và tên: " + (data.cus_name ? data.cus_name : ''), style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 1500,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Giới: " + ((!data.cus_gender || data.cus_gender && data.cus_gender == 2) ? 'Khác' : (data.cus_gender == 1 ? 'Nam' : 'Nữ')), style: "size14"})],
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 1010,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Tuổi: " + (yearOld > 0 ? yearOld : ''), style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function tableLength(data){
    const table = new Table({
        columnWidths: [3000, 3000, 3010],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Cao (m): " + (data.cus_length ? data.cus_length : ''), style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "CNTC (kg): " + (data.cus_cntc ? data.cus_cntc : ''), style: "size14"})],
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3010,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "CNHT (kg): " + (data.cus_cnht ? data.cus_cnht : ''), style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function tableCNTC(data){
    const table = new Table({
        columnWidths: [4505, 4505],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "CN chuẩn/CN khuyến nghị: ", style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "CC chuẩn (cm): ", style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function tableHongCau(data){
    const table = new Table({
        columnWidths: [3000, 3000, 3010],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Hồng cầu: " + (data.erythrocytes ? data.erythrocytes : '') + " (T/L)", style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3000,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Hemoglobin: " + (data.cus_bc ? data.cus_bc : '') + " (g/L)", style: "size14"})],
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 3010,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "BC: " + (data.cus_tc ? data.cus_tc : ''), style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function tableAlbumin(data){
    const table = new Table({
        columnWidths: [4505, 4505],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Albumin: " + (data.cus_albumin ? data.cus_albumin : '')  + " (g/L)", style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Na+/K+/Cl-: " + (data.cus_nakcl ? data.cus_nakcl : ''), style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function tableAst(data){
    const table = new Table({
        columnWidths: [4505, 4505],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "AST/ALT/GGT: " + (data.cus_astaltggt ? data.cus_astaltggt : '')  + " (U/L)", style: "size14"})]
                    }),
                    new TableCell({
                        borders:{
                            top: {style: BorderStyle.NONE, color: "FFFFFF"},
                            bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                            left: {style: BorderStyle.NONE, color: "FFFFFF"},
                            right: {style: BorderStyle.NONE, color: "FFFFFF"},
                        },
                        width: {
                            size: 4505,
                            type: WidthType.DXA,
                        },
                        children: [new Paragraph({text: "Ure/creatinin: " + (data.cus_urecreatinin ? data.cus_urecreatinin : ''), style: "size14"})],
                    })
                ],
            }),
        ]
    });
    return table;
}

function getMedicine(prescription){
    try {
        console.log("getMedicine", prescription);
        let rowTables = [];
        if(prescription && prescription.length > 0){
            for(let item of prescription){
                rowTables.push(new Paragraph({
                    text: item.stt + ". " + (item.name ? item.name : '') + " x " + (item.total ? item.total : 1) + " " + (item.unit ? item.unit : ''),
                    style: "size14",
                    indent: {
                        left: 1024
                    }
                }));
                rowTables.push(new Paragraph({
                    text: item.note ? item.note : '',
                    style: "size14",
                    indent: {
                        left: 1224
                    }
                }));
            }
        }
        return rowTables; 
    } catch (error) {
        
    }
}

module.exports = router;