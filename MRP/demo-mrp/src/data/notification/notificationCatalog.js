// Notification Catalog — encodes PRD section 6 ("Notification Catalog").
//
// Each entry is keyed `${moduleKey}.${triggerKey}` and describes:
//   recipientRule : who receives it (resolved to users/emails by the engine)
//   channels      : { inApp, email } — which surfaces fire
//   todo          : action-required Todo descriptor (or null)
//   inApp(ctx)    : { title:{en,id}, body:{en,id}, cta:{en,id} }
//   email(ctx)    : { subject:{en,id}, body:{en,id} }
//
// `ctx` carries the dynamic [bracket] variables injected at send time:
//   number, submitterName, approverName, approverNames, reason, note,
//   customerPicName, customerCompany, workOrderNo, requesterName,
//   preparerName, requestId, approvedStatus

const quote = (s) => `"${s ?? ""}"`;
const quoteId = (s) => `“${s ?? ""}”`;

// Build the full internal-approval lifecycle (submitted → one approved →
// all approved → rejected → need revision) for a module that follows the
// standard "all approvers must approve" pattern.
const makeApprovalLifecycle = (noun, approvedStatus) => ({
  submitted: {
    recipientRule: "all_approvers",
    channels: { inApp: true, email: true },
    todo: {
      type: "approval",
      tag: { en: "Needs your approval", id: "Perlu persetujuan Anda" },
      action: { en: "Review", id: "Tinjau" },
    },
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} needs your approval`,
        id: `${noun.id} ${c.number} memerlukan persetujuan Anda`,
      },
      body: {
        en: `Submitted by ${c.submitterName} is waiting for your review.`,
        id: `Diajukan oleh ${c.submitterName} dan sedang menunggu peninjauan Anda.`,
      },
      cta: { en: "Review", id: "Tinjau" },
    }),
    email: (c) => {
      const multi = (c.approverNames || []).length > 1;
      const listLine = multi
        ? ` All listed approvers must approve: ${(c.approverNames || []).join(", ")}.`
        : "";
      const listLineId = multi
        ? ` Semua approver berikut harus menyetujui: ${(c.approverNames || []).join(", ")}.`
        : "";
      return {
        subject: {
          en: `${noun.en} ${c.number} needs your approval`,
          id: `${noun.id} ${c.number} memerlukan persetujuan Anda`,
        },
        body: {
          en: `Hi, ${c.submitterName} submitted ${c.number} for approval.${listLine}`,
          id: `Halo, ${c.submitterName} mengajukan ${c.number} untuk disetujui.${listLineId}`,
        },
      };
    },
  },

  one_approved: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} — approved by ${c.approverName}`,
        id: `${noun.id} ${c.number} — disetujui oleh ${c.approverName}`,
      },
      body: {
        en: `${c.approverName} has approved your ${noun.en}.`,
        id: `${c.approverName} telah menyetujui ${noun.id} Anda.`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} — approved by ${c.approverName}`,
        id: `${noun.id} ${c.number} — disetujui oleh ${c.approverName}`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} has approved ${noun.en} ${c.number}.`,
        id: `Halo ${c.submitterName}, ${c.approverName} telah menyetujui ${noun.id} ${c.number}.`,
      },
    }),
  },

  all_approved: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} has been approved`,
        id: `${noun.id} ${c.number} telah disetujui`,
      },
      body: {
        en: `All reviewers have approved. Status is now ${approvedStatus.en}.`,
        id: `Semua peninjau telah menyetujui. Status sekarang menjadi ${approvedStatus.id}.`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} has been approved`,
        id: `${noun.id} ${c.number} telah disetujui`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${noun.en} ${c.number} has been approved by all reviewers. It is now ${approvedStatus.en}.`,
        id: `Halo ${c.submitterName}, ${noun.id} ${c.number} telah disetujui oleh semua peninjau. Status sekarang ${approvedStatus.id}.`,
      },
    }),
  },

  rejected: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} was rejected`,
        id: `${noun.id} ${c.number} ditolak`,
      },
      body: {
        en: `${c.approverName} rejected your ${noun.en}. Reason: ${quote(c.reason)}`,
        id: `${c.approverName} menolak ${noun.id} Anda. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: "View", id: "Lihat" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} was rejected`,
        id: `${noun.id} ${c.number} ditolak`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `Halo ${c.submitterName}, ${c.approverName} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
    }),
  },

  need_revision: {
    recipientRule: "submitter_cc_approvers",
    channels: { inApp: true, email: true },
    todo: {
      type: "revision",
      tag: { en: "Needs revision", id: "Perlu revisi" },
      action: { en: "Edit", id: "Edit" },
    },
    inApp: (c) => ({
      title: {
        en: `${noun.en} ${c.number} needs revision`,
        id: `${noun.id} ${c.number} memerlukan revisi`,
      },
      body: {
        en: `${c.approverName} requested changes. Note: ${quote(c.note)}`,
        id: `${c.approverName} meminta perubahan. Catatan: ${quoteId(c.note)}`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} needs revision`,
        id: `${noun.id} ${c.number} memerlukan revisi`,
      },
      body: {
        en: `Hi ${c.submitterName}, ${c.approverName} requested changes to ${c.number}. Revision note: ${quote(c.note)}. Please revise and resubmit.`,
        id: `Halo ${c.submitterName}, ${c.approverName} meminta perubahan pada ${c.number}. Catatan revisi: ${quoteId(c.note)}. Mohon revisi dan kirim ulang.`,
      },
    }),
  },
});

// Customer-portal approval lifecycle (any-one-wins). Recipient = entity PIC
// (the person who sent the Customer Portal). No CC.
const makeCustomerLifecycle = (noun) => ({
  customer_approved: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Customer approved ${noun.en} ${c.number}`,
        id: `Customer menyetujui ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} has approved ${noun.en} ${c.number}. It is now Approved.`,
        id: `${c.customerPicName} dari ${c.customerCompany} telah menyetujui ${noun.id} ${c.number}. Status sekarang menjadi Approved.`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
    email: (c) => ({
      subject: {
        en: `Customer approved ${noun.en} ${c.number}`,
        id: `Customer menyetujui ${noun.id} ${c.number}`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} has approved ${noun.en} ${c.number}. It is now Approved.`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} telah menyetujui ${noun.id} ${c.number}. Status sekarang Approved.`,
      },
    }),
  },
  customer_rejected: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: null,
    inApp: (c) => ({
      title: {
        en: `Customer rejected ${noun.en} ${c.number}`,
        id: `Customer menolak ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `${c.customerPicName} dari ${c.customerCompany} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
      cta: { en: `View ${noun.en}`, id: `Lihat ${noun.id}` },
    }),
    email: (c) => ({
      subject: {
        en: `Customer rejected ${noun.en} ${c.number}`,
        id: `Customer menolak ${noun.id} ${c.number}`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} rejected ${noun.en} ${c.number}. Reason: ${quote(c.reason)}`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} menolak ${noun.id} ${c.number}. Alasan: ${quoteId(c.reason)}`,
      },
    }),
  },
  customer_revision: {
    recipientRule: "entity_pic",
    channels: { inApp: true, email: true },
    todo: {
      type: "revision",
      tag: { en: "Needs revision", id: "Perlu revisi" },
      action: { en: "Edit", id: "Edit" },
    },
    inApp: (c) => ({
      title: {
        en: `Customer requested changes on ${noun.en} ${c.number}`,
        id: `Customer meminta perubahan pada ${noun.id} ${c.number}`,
      },
      body: {
        en: `${c.customerPicName} from ${c.customerCompany} requested changes. Note: ${quote(c.note)}`,
        id: `${c.customerPicName} dari ${c.customerCompany} meminta perubahan. Catatan: ${quoteId(c.note)}`,
      },
      cta: { en: "Edit & Resubmit", id: "Edit & Kirim Ulang" },
    }),
    email: (c) => ({
      subject: {
        en: `${noun.en} ${c.number} — customer requested changes`,
        id: `${noun.id} ${c.number} — customer meminta perubahan`,
      },
      body: {
        en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} requested changes to ${noun.en} ${c.number}. Note: ${quote(c.note)}. Please revise and resubmit.`,
        id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} meminta perubahan pada ${noun.id} ${c.number}. Catatan: ${quoteId(c.note)}. Mohon revisi dan kirim ulang.`,
      },
    }),
  },
});

const NOUNS = {
  rfq: { en: "RFQ", id: "RFQ" },
  quote: { en: "Quote", id: "Quote" },
  order: { en: "Order", id: "Order" },
  purchase_order: { en: "Purchase Order", id: "Purchase Order" },
  custom_product_request: { en: "Custom Product Request", id: "Custom Product Request" },
  invoice: { en: "Invoice", id: "Invoice" },
};

export const NOTIFICATION_CATALOG = {
  rfq: makeApprovalLifecycle(NOUNS.rfq, { en: "Approved", id: "Approved" }),
  quote: {
    ...makeApprovalLifecycle(NOUNS.quote, { en: "Issued", id: "Issued" }),
    ...makeCustomerLifecycle(NOUNS.quote),
  },
  order: makeApprovalLifecycle(NOUNS.order, { en: "Confirmed", id: "Confirmed" }),
  purchase_order: {
    ...makeApprovalLifecycle(NOUNS.purchase_order, { en: "Issued", id: "Issued" }),
    // Cross-module: on PO issued, also notify the linked Work Order creator.
    wo_cross_module: {
      recipientRule: "wo_creator",
      channels: { inApp: true, email: false },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Purchase Order ${c.number} issued for ${c.workOrderNo}`,
          id: `Purchase Order ${c.number} diterbitkan untuk ${c.workOrderNo}`,
        },
        body: {
          en: `The Purchase Order linked to your Work Order ${c.workOrderNo} has been approved and issued.`,
          id: `Purchase Order yang terkait dengan Work Order ${c.workOrderNo} Anda telah disetujui dan diterbitkan.`,
        },
        cta: { en: "View Purchase Order", id: "Lihat Purchase Order" },
      }),
      email: null,
    },
  },
  custom_product_request: makeApprovalLifecycle(NOUNS.custom_product_request, {
    en: "Completed",
    id: "Completed",
  }),

  invoice: {
    ...makeCustomerLifecycle(NOUNS.invoice),
    // Payment proof — portal upload notifies the invoice owner (PIC).
    proof_uploaded: {
      recipientRule: "entity_pic",
      channels: { inApp: true, email: true },
      todo: {
        type: "proof",
        tag: { en: "Review proof", id: "Tinjau bukti" },
        action: { en: "Review", id: "Tinjau" },
      },
      inApp: (c) => ({
        title: {
          en: `Payment proof uploaded — Invoice ${c.number}`,
          id: `Bukti pembayaran telah diunggah — Invoice ${c.number}`,
        },
        body: {
          en: `${c.customerPicName} from ${c.customerCompany} uploaded a payment proof. Please review and confirm.`,
          id: `${c.customerPicName} dari ${c.customerCompany} telah mengunggah bukti pembayaran. Mohon tinjau dan konfirmasi.`,
        },
        cta: { en: "Review Proof", id: "Tinjau Bukti" },
      }),
      email: (c) => ({
        subject: {
          en: `Payment proof uploaded — Invoice ${c.number}`,
          id: `Bukti pembayaran telah diunggah — Invoice ${c.number}`,
        },
        body: {
          en: `Hi ${c.picName}, ${c.customerPicName} from ${c.customerCompany} uploaded a payment proof for Invoice ${c.number}. Please review.`,
          id: `Halo ${c.picName}, ${c.customerPicName} dari ${c.customerCompany} mengunggah bukti pembayaran untuk Invoice ${c.number}. Mohon tinjau.`,
        },
      }),
    },
    // Admin rejects proof — email only to the customer, reason mandatory.
    proof_rejected: {
      recipientRule: "customer_email",
      channels: { inApp: false, email: true },
      todo: null,
      inApp: null,
      email: (c) => ({
        subject: {
          en: `Action required — re-upload payment proof for Invoice ${c.number}`,
          id: `Perlu tindakan — unggah ulang bukti pembayaran untuk Invoice ${c.number}`,
        },
        body: {
          en: `Hi ${c.customerPicName || "Customer"}, your payment proof for Invoice ${c.number} could not be verified. Reason: ${quote(c.reason)}. Please log in to the portal and re-upload.`,
          id: `Halo ${c.customerPicName || "Customer"}, bukti pembayaran Anda untuk Invoice ${c.number} tidak dapat diverifikasi. Alasan: ${quoteId(c.reason)}. Mohon masuk ke portal dan unggah ulang.`,
        },
      }),
    },
  },

  material_request: {
    transfer_started: {
      recipientRule: "requester",
      channels: { inApp: true, email: true },
      todo: {
        type: "receipt",
        tag: { en: "Confirm receipt", id: "Konfirmasi penerimaan" },
        action: { en: "Confirm", id: "Konfirmasi" },
      },
      inApp: (c) => ({
        title: {
          en: `Materials transferred — confirm receipt for ${c.requestId}`,
          id: `Material telah ditransfer — konfirmasi penerimaan untuk ${c.requestId}`,
        },
        body: {
          en: `${c.preparerName} has transferred materials for your request from ${c.workOrderNo}. Please confirm you have received the items.`,
          id: `${c.preparerName} telah mentransfer material untuk permintaan Anda dari ${c.workOrderNo}. Mohon konfirmasi bahwa Anda telah menerima barang tersebut.`,
        },
        cta: { en: "Confirm Receipt", id: "Konfirmasi Penerimaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Materials transferred — confirm receipt for ${c.requestId}`,
          id: `Material telah ditransfer — konfirmasi penerimaan untuk ${c.requestId}`,
        },
        body: {
          en: `Hi ${c.requesterName}, ${c.preparerName} has transferred materials for ${c.requestId} from ${c.workOrderNo}. Please confirm receipt in Labamu.`,
          id: `Halo ${c.requesterName}, ${c.preparerName} telah mentransfer material untuk ${c.requestId} dari ${c.workOrderNo}. Mohon konfirmasi penerimaan di Labamu.`,
        },
      }),
    },
    receipt_confirmed: {
      recipientRule: "preparer",
      channels: { inApp: true, email: false },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Receipt confirmed — ${c.requestId} completed`,
          id: `Penerimaan dikonfirmasi — ${c.requestId} selesai`,
        },
        body: {
          en: `${c.requesterName} has confirmed receipt of materials. Request is now Completed.`,
          id: `${c.requesterName} telah mengonfirmasi penerimaan material. Permintaan sekarang berstatus Completed.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: null,
    },
    receipt_rejected: {
      recipientRule: "preparer",
      channels: { inApp: true, email: true },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Receipt rejected — ${c.requestId}`,
          id: `Penerimaan ditolak — ${c.requestId}`,
        },
        body: {
          en: `${c.requesterName} rejected the transferred materials. Reason: ${quote(c.reason)}`,
          id: `${c.requesterName} menolak material yang telah ditransfer. Alasan: ${quoteId(c.reason)}`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: (c) => ({
        subject: {
          en: `Receipt rejected — ${c.requestId}`,
          id: `Penerimaan ditolak — ${c.requestId}`,
        },
        body: {
          en: `Hi ${c.preparerName}, ${c.requesterName} rejected the transferred materials for ${c.requestId}. Reason: ${quote(c.reason)}. The request has been closed.`,
          id: `Halo ${c.preparerName}, ${c.requesterName} menolak material yang ditransfer untuk ${c.requestId}. Alasan: ${quoteId(c.reason)}. Permintaan telah ditutup.`,
        },
      }),
    },
    cancelled_by_preparer: {
      recipientRule: "requester",
      channels: { inApp: true, email: false },
      todo: null,
      inApp: (c) => ({
        title: {
          en: `Material request ${c.requestId} cancelled`,
          id: `Permintaan material ${c.requestId} dibatalkan`,
        },
        body: {
          en: `${c.preparerName} has cancelled your material request.`,
          id: `${c.preparerName} telah membatalkan permintaan material Anda.`,
        },
        cta: { en: "View Request", id: "Lihat Permintaan" },
      }),
      email: null,
    },
  },
};

export const getCatalogEntry = (moduleKey, triggerKey) =>
  NOTIFICATION_CATALOG[moduleKey]?.[triggerKey] || null;
