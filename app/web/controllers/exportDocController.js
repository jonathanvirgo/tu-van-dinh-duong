var express         = require('express'),
    router          = express.Router(),
    webService      = require('./../models/webModel'),
    logService      = require('../../admin/models/logModel'),
    moment          = require('moment');

const docx = require("docx");
const { AlignmentType, Document, TextDirection, Packer, Paragraph, TextRun, VerticalAlign, Table, TableCell, TableRow, WidthType, BorderStyle, convertInchesToTwip} = docx;

router.get("/examine", (req, res) => {
    try {
        if (!req.user) {
            let message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(message);
            return;
        }
        let now = moment();
        let examine_id = req.query.examine_id;
        let data = {};
        if(examine_id){
            webService.getListTable('SELECT * FROM examine WHERE id = ?', [examine_id]).then(async responseData =>{
                if(responseData.success){
                    if(responseData.data && responseData.data.length > 0){
                        data = responseData.data[0];
                        let yearOld = webService.caculateYearOld(moment(data.cus_birthday).format("YYYY-MM-DD"));
                        let medicine = getMedicine(data.prescription ? JSON.parse(data.prescription) : []);
                        const doc = new Document({
                            creator: "dinhduonghotro.com",
                            title: "Phiếu khám ${data.cus_name ? data.cus_name : ''}",
                            description: "Phiếu khám ${data.cus_name ? data.cus_name : ''}",
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
                                                before: 120,
                                                after: 120
                                            }
                                        }
                                    },
                                    {
                                        id: "size14",
                                        basedOn: "Normal",
                                        next: "Normal",
                                        quickFormat: true,
                                        run: {
                                            size: 28
                                        },
                                        paragraph: {
                                            spacing: {
                                                before: 60
                                            }
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
                                    paramFollowerStyle(req.user.hospital_name ? req.user.hospital_name : '', "hospital"),
                                    new Paragraph({
                                        text: req.user.department_name ? req.user.department_name : '',
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
                                    paramFollowerStyle("1. THÔNG TIN CHUNG", "title"),
                                    tableName(data, yearOld),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Điện thoại: " + (data.cus_phone ? data.cus_phone : '')
                                            }),
                                        ],
                                        style: "size14"
                                    }),
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
                                    paramFollowerStyle("2. KHÁM LÂM SÀNG", "title"),
                                    paramFollowerStyle(data.clinical_examination ? data.clinical_examination : '', "size14"),
                                    paramFollowerStyle("3. KHÁM DINH DƯỠNG", "title"),
                                    tableDinhduong(data),
                                    paramFollowerStyle("4. KẾT QUẢ XÉT NGHIỆM", "title"),
                                    tableHongCau(data),
                                    tableAlbumin(data),
                                    tableAst(data),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Bilirubin TP/TT(μmol/L): " + (data.cus_bilirubin ? data.cus_bilirubin : '')
                                            })
                                        ],
                                        style: "size14"
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: "Khác: " + (data.exa_note ? data.exa_note : '')
                                            })
                                        ],
                                        style: "size14"
                                    }),
                                    paramFollowerStyle("5. LỜI KHUYÊN DINH DƯỠNG", "title"),
                                    tableNutritionAdvice(data),
                                    paramFollowerStyle("6. CHẾ ĐỘ VẬN ĐỘNG, SINH HOẠT", "title"),
                                    new Paragraph({
                                        children: data.active_mode_of_living ? data.active_mode_of_living.split("\n").map(line=> textRunBreak(line)) : [],
                                        style: "size14",
                                    }),
                                    paramFollowerStyle("7. BỔ SUNG", "title"),
                                    ...medicine,
                                    new Paragraph({
                                        text: `Hà Nội, ngày ${String(now.date()).padStart(2, '0')} tháng ${String((now.month() + 1)).padStart(2, '0')} năm ${now.year()}`,
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
                        let filename = "Phieu_kham_" + webService.removeVietnameseTones(data.cus_name).replaceAll(" ", "_") + "_" + String(now.date()).padStart(2, '0') + "_" + String((now.month() + 1)).padStart(2, '0') + "_" + now.year(); 
                        res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.docx');
                        res.send(Buffer.from(b64string, 'base64')); 
                    }else{
                        return res.json('Không có dữ liệu');
                    }
                }else{
                    return res.json(responseData.message);
                }
            })
        }else{
            return res.json('Thiếu Id phiếu khám');
        }
    } catch (error) {
        logService.create(req, error.message).then(function() {
            res.json(error.message);
        }); 
    }
});

function tableNutritionAdvice(data){
    try {
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
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableNutritionAdvice");
        return new Table();
    }
}

function tableName(data, yearOld){
    try {
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
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableName");
        return new Table();
    }
}

function tableLength(data){
    try {
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
                            children: [new Paragraph({text: "CNTC (kg): " + (data.cus_cnbt ? data.cus_cnbt : ''), style: "size14"})],
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
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableLength");
        return new Table();
    }
}

function tableCNTC(data){
    try {
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
                            children: [new Paragraph({text: "CN chuẩn (CN khuyến nghị): " + (data.cus_cntc ? data.cus_cntc : ''), style: "size14"})]
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
                            children: [new Paragraph({text: "CC chuẩn (m): " + (data.cus_cctc ? data.cus_cctc : ''), style: "size14"})],
                        })
                    ],
                }),
            ]
        });
        return table;
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableCNTC");
        return new Table();
    }
}

function tableHongCau(data){
    try {
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
                            children: [new Paragraph({text: "Hemoglobin(g/L): " + (data.erythrocytes ? data.erythrocytes : ''), style: "size14"})],
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
                            children: [new Paragraph({text: "BC(G/L): " + (data.cus_bc ? data.cus_bc : ''), style: "size14"})],
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
                            children: [new Paragraph({text: "Tiểu cầu(G/L): " + (data.cus_tc ? data.cus_tc : ''), style: "size14"})]
                        })
                    ],
                }),
            ]
        });
        return table;
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableHongCau");
        return new Table();
    }
}

function tableDinhduong(data){
    try {
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
                            children: [new Paragraph({text: "Tỉ lệ mỡ(%): " + (data.cus_fat ? data.cus_fat : ''), style: "size14"})]
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
                            children: [new Paragraph({text: "Tỉ lệ nước(%): " + (data.cus_water ? data.cus_water : ''), style: "size14"})],
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
                            children: [new Paragraph({text: "Mỡ nội tạng: " + (data.cus_visceral_fat ? data.cus_visceral_fat : ''), style: "size14"})],
                        })
                    ],
                }),
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
                            children: [new Paragraph({text: "CHCB(kcal): " + (data.cus_chcb ? data.cus_chcb : ''), style: "size14"})]
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
                            children: [new Paragraph({text: "Cân nặng xương(Kg): " + (data.cus_bone_weight ? data.cus_bone_weight : ''), style: "size14"})],
                        })
                    ],
                }),
            ]
        });
        return table;
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableHongCau");
        return new Table();
    }
}

function tableAlbumin(data){
    try {
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
                            children: [new Paragraph({text: "Albumin(G/L): " + (data.cus_albumin ? data.cus_albumin : ''), style: "size14"})]
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
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableAlbumin");
        return new Table();
    }
}

function tableAst(data){
    try {
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
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller tableAst");
        return new Table();
    }
}

function getMedicine(prescription){
    try {
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
        webService.addToLogService(error.message, "Export Doc Controller getMedicine");
        return [];
    }
}

function paramFollowerStyle(text, style){
    try {
        return new Paragraph({
            text: text,
            style: style,
        });
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller paramFollowerStyle");
        return new Paragraph();
    }
}

function textRunBreak(text){
    try {
        return new TextRun({
            text: text,
            break: 1
        })    
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller textRunBreak");
        return new TextRun();
    }
}

router.get("/menu-example", async (req, res) =>{
    try {
        if (!req.user) {
            let message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(message);
            return;
        }
        let now = moment();
        let examine_id = req.query.examine_id;
        let menu_id = req.query.menu_id;
        let data = {};
        let examine = {};
        if(examine_id){
            webService.getListTable('SELECT * FROM examine WHERE id = ?', [examine_id]).then(async responseData =>{
                if(responseData.success){
                    if(responseData.data && responseData.data.length > 0){
                        examine = responseData.data[0];
                        let menuExampleText = examine.menu_example
                        let menuExampleList = menuExampleText && webService.isJSON(menuExampleText) ? JSON.parse(menuExampleText) : [];
                        if(menuExampleList.length > 0){
                            for(let item of menuExampleList){
                                if(item.id == parseInt(menu_id)){
                                    data = item;
                                    break;
                                }
                            }
                            if(data){
                                let sqlGetAlternativeFood = 'SELECT food_main, food_replace FROM alternative_food';
                                let dataAlternativeFood = await webService.getListTable(sqlGetAlternativeFood);
                                let menuExamineDetail = menuExapleList(data);
                                let listAlternativeFood = getRowAlternativeFood(dataAlternativeFood);
                                const doc = new Document({
                                    creator: "dinhduonghotro.com",
                                    title: "Thực đơn mẫu cho ${examine.cus_name ? examine.cus_name : ''}",
                                    description: "Thực đơn mẫu cho ${examine.cus_name ? examine.cus_name : ''}",
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
                                                        after: 120
                                                    }
                                                }
                                            },
                                            {
                                                id: "title2",
                                                basedOn: "title",
                                                next: "Normal",
                                                quickFormat: true,
                                                paragraph: {
                                                    spacing: {
                                                        before: 360
                                                    }
                                                }
                                            },
                                            {
                                                id: "size14",
                                                basedOn: "Normal",
                                                next: "Normal",
                                                quickFormat: true,
                                                run: {
                                                    size: 28
                                                },
                                                paragraph: {
                                                    spacing: {
                                                        before: 60
                                                    }
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
                                            new Table({
                                                columnWidths: [5000, 4010],
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
                                                                    size: 5000,
                                                                    type: WidthType.DXA,
                                                                },
                                                                children: [
                                                                    new Paragraph({
                                                                        text: "THỰC ĐƠN MẪU",
                                                                        alignment: AlignmentType.CENTER,
                                                                        style: "hospital",
                                                                        spacing:{
                                                                            after: 480
                                                                        }
                                                                    }),
                                                                    new Table({
                                                                        columnWidths: [1000, 3000, 1000],
                                                                        rows: [
                                                                            new TableRow({
                                                                                children: [
                                                                                    new TableCell({
                                                                                        children: [
                                                                                            new Paragraph({text: "Giờ", style: "table_heading"})
                                                                                        ],
                                                                                        width: {
                                                                                            size: 1000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                    }),
                                                                                    new TableCell({
                                                                                        children: [
                                                                                            new Paragraph({text: "Thực phẩm", style: "table_heading"})
                                                                                        ],
                                                                                        width: {
                                                                                            size: 3000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                    }),
                                                                                    new TableCell({
                                                                                        children: [
                                                                                            new Paragraph({text: "gam", style: "table_heading"})
                                                                                        ],
                                                                                        width: {
                                                                                            size: 1000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                    })
                                                                                ]
                                                                            }),
                                                                            ...menuExamineDetail
                                                                        ]
                                                                    }),
                                                                    new Paragraph({
                                                                        text: "Tổng lượng thực phẩm / ngày",
                                                                        style: "title2"
                                                                    }),
                                                                    new Table({
                                                                        columnWidths: [3500, 1500],
                                                                        rows: [
                                                                            new TableRow({
                                                                                children: [
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 4000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: [
                                                                                            new Paragraph({
                                                                                                text: "Thịt / cá (g)",
                                                                                                style: "size14",
                                                                                                alignment: AlignmentType.CENTER
                                                                                            }),
                                                                                        ]
                                                                                    }),
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 2000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: []
                                                                                    })
                                                                                ]
                                                                            }),
                                                                            new TableRow({
                                                                                children: [
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 4000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: [
                                                                                            new Paragraph({
                                                                                                text: "Rau (g)",
                                                                                                style: "size14",
                                                                                                alignment: AlignmentType.CENTER
                                                                                            }),
                                                                                        ]
                                                                                    }),
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 2000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: []
                                                                                    })
                                                                                ]
                                                                            }),
                                                                            new TableRow({
                                                                                children: [
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 4000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: [
                                                                                            new Paragraph({
                                                                                                text: "Quả chín (g)",
                                                                                                style: "size14",
                                                                                                alignment: AlignmentType.CENTER
                                                                                            }),
                                                                                        ]
                                                                                    }),
                                                                                    new TableCell({
                                                                                        width: {
                                                                                            size: 2000,
                                                                                            type: WidthType.DXA,
                                                                                        },
                                                                                        children: []
                                                                                    })
                                                                                ]
                                                                            })
                                                                        ]
                                                                    })
                                                                ]
                                                            }),
                                                            new TableCell({
                                                                borders:{
                                                                    top: {style: BorderStyle.NONE, color: "FFFFFF"},
                                                                    bottom: {style: BorderStyle.NONE, color: "FFFFFF"},
                                                                    left: {style: BorderStyle.NONE, color: "FFFFFF"},
                                                                    right: {style: BorderStyle.NONE, color: "FFFFFF"},
                                                                },
                                                                width: {
                                                                    size: 4010,
                                                                    type: WidthType.DXA,
                                                                },
                                                                children: [
                                                                    new Paragraph({
                                                                        text: "Thực phẩm thay thế tương đương",
                                                                        style: "title"
                                                                    }),
                                                                    new Table({
                                                                        rows: [
                                                                            ...listAlternativeFood
                                                                        ]
                                                                    }),
                                                                ],
                                                                margins: {
                                                                    left: convertInchesToTwip(0.2)
                                                                }
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }),
                                            new Paragraph({
                                                text: "Ghi chú",
                                                style: "title2"
                                            }),
                                            paramFollowerStyle(data.note ? data.note : '', "size14")
                                        ]
                                    }]
                                });    
                                const b64string = await Packer.toBase64String(doc);
                                let filename = "Thuc_don_mau_" + webService.removeVietnameseTones(examine.cus_name).replaceAll(" ", "_") + "_" + String(now.date()).padStart(2, '0') + "_" + String(now.month()).padStart(2, '0') + "_" + now.year(); 
                                res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.docx');
                                res.send(Buffer.from(b64string, 'base64')); 
                            }else{
                                return res.json("Thiếu dữ liệu!");
                            }
                        }else{
                            return res.json('Không tìm thấy thực đơn');
                        }
                    }else{
                        return res.json('Không có dữ liệu');
                    }
                }else{
                    return res.json(responseData.message);
                }
            })
        }else{
            return res.json('Thiếu Id phiếu khám');
        }
    } catch (error) {
        logService.create(req, error.message).then(function() {
            res.json(error.message);
        }); 
    }
});

function menuExapleList(data){
    try {
        let listDetailMenu = [];
        if(data && data.detail.length > 0){
            for(let item of data.detail){
                listDetailMenu.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({text: item.name, style: "table_heading"})
                                ],
                                width: {
                                    size: 1000,
                                    type: WidthType.DXA,
                                },
                                textDirection: TextDirection.BOTTOM_TO_TOP_LEFT_TO_RIGHT,
                                verticalAlign: VerticalAlign.CENTER,
                                rowSpan: item.listFood.length + 1
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({text: item.name_course, style: "table_cell"})
                                ],
                                width: {
                                    size: 5000,
                                    type: WidthType.DXA,
                                },
                                verticalAlign: VerticalAlign.CENTER,
                                columnSpan: 2
                            })
                        ]
                    })
                );
                if(item.listFood.length > 0){
                    for(let food of item.listFood){
                        listDetailMenu.push(
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({text: food.name, style: "table_cell"})
                                        ],
                                        width: {
                                            size: 4000,
                                            type: WidthType.DXA,
                                        }
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({text: String(food.weight), style: "table_cell"})
                                        ],
                                        width: {
                                            size: 1000,
                                            type: WidthType.DXA,
                                        }
                                    })
                                ]
                            })
                        );
                    }
                }
            }
            return listDetailMenu;
        }else{
            return listDetailMenu;
        }
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller menuExapleList");
        return [];
    }
}

function getRowAlternativeFood(data){
    try {
        let listRowAlternativeFood = [];
        if(data.success && data.data && data.data.length > 0){
            for(let item of data.data){
                listRowAlternativeFood.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({text: String(item.food_main), style: "size14"})]
                            }),
                            new TableCell({
                                children: [new Paragraph({text: String(item.food_replace), style: "size14"})]
                            })
                        ],
                    })
                );
            }
        }
        return listRowAlternativeFood;
    } catch (error) {
        webService.addToLogService(error.message, "Export Doc Controller getRowAlternativeFood");
        return [];
    }
}

router.get("/prescription", async (req, res) =>{
    try {
        if (!req.user) {
            let message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(message);
            return;
        }
        let now = moment();
        let examine_id = req.query.examine_id;
        let data = {};
        if(examine_id){
            webService.getListTable('SELECT * FROM examine WHERE id = ?', [examine_id]).then(async responseData =>{
                if(responseData.success){
                    if(responseData.data && responseData.data.length > 0){
                        data = responseData.data[0];
                        let yearOld = webService.caculateYearOld(moment(data.cus_birthday).format("YYYY-MM-DD"));
                        let medicine = getMedicine(data.prescription ? JSON.parse(data.prescription) : []);
                        const doc = new Document({
                            creator: "dinhduonghotro.com",
                            title: "Phiếu tư vấn ${data.cus_name ? data.cus_name : ''}",
                            description: "Phiếu tư vấn ${data.cus_name ? data.cus_name : ''}",
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
                                                before: 120,
                                                after: 120
                                            }
                                        }
                                    },
                                    {
                                        id: "size14",
                                        basedOn: "Normal",
                                        next: "Normal",
                                        quickFormat: true,
                                        run: {
                                            size: 28
                                        },
                                        paragraph: {
                                            spacing: {
                                                before: 60
                                            }
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
                                    }
                                ],
                            },
                            sections: [{
                                children: [
                                    new Paragraph({
                                        text: "PHIẾU TƯ VẤN",
                                        alignment: AlignmentType.CENTER,
                                        style: "hospital",
                                        spacing:{
                                            after: 480
                                        }
                                    }),
                                    paramFollowerStyle("1. THÔNG TIN CHUNG", "title"),
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
                                        style: "size14",
                                        spacing:{
                                            after: 240
                                        }
                                    }),
                                    ...medicine,
                                    new Paragraph({
                                        text: `Hà Nội, ngày ${String(now.date()).padStart(2, '0')} tháng ${String((now.month() + 1)).padStart(2, '0')} năm ${now.year()}`,
                                        alignment: AlignmentType.RIGHT,
                                        style: "size14",
                                        spacing:{
                                            before: 240
                                        }
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
                        let filename = "Phieu_tu_van_" + webService.removeVietnameseTones(data.cus_name).replaceAll(" ", "_") + "_" + String(now.date()).padStart(2, '0') + "_" + String((now.month() + 1)).padStart(2, '0') + "_" + now.year(); 
                        res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.docx');
                        res.send(Buffer.from(b64string, 'base64')); 
                    }else{
                        return res.json('Không có dữ liệu');
                    }
                }else{
                    return res.json(responseData.message);
                }
            })
        }else{
            return res.json('Thiếu Id phiếu khám');
        }
    } catch (error) {
        logService.create(req, error.message).then(function() {
            res.json(error.message);
        }); 
    }
});

module.exports = router;