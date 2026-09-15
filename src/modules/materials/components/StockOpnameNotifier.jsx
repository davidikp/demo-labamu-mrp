import { useEffect, useRef } from "react";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { getStockOpnames, subscribeStockOpnames } from "../mock/stockOpnamesStore.js";
import { CURRENT_USER } from "../../../data/notification/notificationConfig.js";

// Always-mounted watcher (sibling to MaterialUploadNotifier) that fires a
// real notification when a Stock Opname's simulated background processing
// finishes — regardless of which page is on screen when the store's
// setTimeout resolves. PRD "Stock Opname - Notification":
//   - Ready for Review only for the upload path (Normalizing Data -> Review)
//     — a manual Stock Opname goes straight into an editable Review Data
//     with no such transition to watch.
//   - Completed for a successful Processing -> Completed run.
//   - Canceled only for a *system* cancellation (Processing -> Cancelled) —
//     a user cancelling their own draft from Review/Mapping never passes
//     through Processing first, so that transition never fires here.
export const StockOpnameNotifier = () => {
  const { notify } = useNotifications();
  const prevStatusRef = useRef(null);

  useEffect(() => {
    if (!prevStatusRef.current) {
      prevStatusRef.current = new Map(getStockOpnames().map((s) => [s.id, s.status]));
    }

    const unsubscribe = subscribeStockOpnames((records) => {
      records.forEach((record) => {
        const prevStatus = prevStatusRef.current.get(record.id);
        if (prevStatus !== record.status) {
          if (record.status === "Review" && prevStatus === "Normalizing Data") {
            notify("stock_opname", "stock_opname_ready_for_review", {
              entityId: record.id,
              fileName: record.sourceFile,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (record.status === "Completed" && prevStatus === "Processing") {
            notify("stock_opname", "stock_opname_completed", {
              entityId: record.id,
              fileName: record.sourceFile,
              eligibleUsers: [CURRENT_USER],
            });
          } else if (record.status === "Cancelled" && prevStatus === "Processing") {
            notify("stock_opname", "stock_opname_canceled", {
              entityId: record.id,
              fileName: record.sourceFile,
              eligibleUsers: [CURRENT_USER],
            });
          }
        }
        prevStatusRef.current.set(record.id, record.status);
      });
    });

    return unsubscribe;
  }, [notify]);

  return null;
};
