#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

use std::cell::RefCell;

#[derive(Clone, Debug)]
pub struct DataPoint {
    target: bool,
    privileged: bool,
    predicted: bool,
}

thread_local! {
    static DATA_POINTS: RefCell<Vec<DataPoint>> = RefCell::new(Vec::new());
}

#[ic_cdk::update]
fn add_data_point(target: bool, privileged: bool, predicted: bool) {
    DATA_POINTS.with(|data_points| {
        data_points.borrow_mut().push(DataPoint {
            target,
            privileged,
            predicted,
        });
    });
}

#[ic_cdk::query]
fn statistical_parity_difference() -> i128 {
    let (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count) =
        calculate_group_counts();

    assert!(privileged_count > 0 && unprivileged_count > 0, "No data for one of the groups");

    let privileged_probability = (privileged_positive_count * 1_000_000_000_000_000_000 / privileged_count) as i128;
    let unprivileged_probability = (unprivileged_positive_count * 1_000_000_000_000_000_000 / unprivileged_count) as i128;

    unprivileged_probability - privileged_probability
}

#[ic_cdk::query]
fn disparate_impact() -> i128 {
    let (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count) =
        calculate_group_counts();

    assert!(privileged_count > 0 && unprivileged_count > 0, "No data for one of the groups");

    let privileged_probability = (privileged_positive_count * 1_000_000_000_000_000_000 / privileged_count) as i128;
    let unprivileged_probability = (unprivileged_positive_count * 1_000_000_000_000_000_000 / unprivileged_count) as i128;

    assert!(privileged_probability > 0, "Privileged group has no positive outcomes");

    (unprivileged_probability * 1_000_000_000_000_000_000) / privileged_probability
}

#[ic_cdk::query]
fn average_odds_difference() -> i128 {
    let (privileged_tp, privileged_fp, privileged_tn, privileged_fn, unprivileged_tp, unprivileged_fp, unprivileged_tn, unprivileged_fn) =
        calculate_confusion_matrix();

    assert!(
        (privileged_tp + privileged_fn) > 0 && (unprivileged_tp + unprivileged_fn) > 0,
        "No positive cases for one of the groups"
    );
    assert!(
        (privileged_fp + privileged_tn) > 0 && (unprivileged_fp + unprivileged_tn) > 0,
        "No negative cases for one of the groups"
    );

    let privileged_tpr = (privileged_tp * 1_000_000_000_000_000_000 / (privileged_tp + privileged_fn)) as i128;
    let unprivileged_tpr = (unprivileged_tp * 1_000_000_000_000_000_000 / (unprivileged_tp + unprivileged_fn)) as i128;
    let privileged_fpr = (privileged_fp * 1_000_000_000_000_000_000 / (privileged_fp + privileged_tn)) as i128;
    let unprivileged_fpr = (unprivileged_fp * 1_000_000_000_000_000_000 / (unprivileged_fp + unprivileged_tn)) as i128;

    ((unprivileged_fpr - privileged_fpr) + (unprivileged_tpr - privileged_tpr)) / 2
}

#[ic_cdk::query]
fn equal_opportunity_difference() -> i128 {
    let (privileged_tp, privileged_fn, unprivileged_tp, unprivileged_fn) =
        calculate_true_positive_false_negative();

    assert!(
        (privileged_tp + privileged_fn) > 0 && (unprivileged_tp + unprivileged_fn) > 0,
        "No positive cases for one of the groups"
    );

    let privileged_tpr = (privileged_tp * 1_000_000_000_000_000_000 / (privileged_tp + privileged_fn)) as i128;
    let unprivileged_tpr = (unprivileged_tp * 1_000_000_000_000_000_000 / (unprivileged_tp + unprivileged_fn)) as i128;

    unprivileged_tpr - privileged_tpr
}

#[ic_cdk::update]
fn add_example_data_points() {
    add_data_point(true, true, true);   // TP for privileged
    add_data_point(false, true, false); // TN for privileged
    add_data_point(true, false, true);  // TP for unprivileged
    add_data_point(false, false, false);// TN for unprivileged
    add_data_point(true, true, true);   // TP for privileged
    add_data_point(false, true, false); // TN for privileged
    add_data_point(true, false, true);  // TP for unprivileged
    add_data_point(true, false, true);  // TP for unprivileged
}

// Helper functions
fn calculate_group_counts() -> (u128, u128, u128, u128) {
    DATA_POINTS.with(|data_points| {
        let mut privileged_count = 0;
        let mut unprivileged_count = 0;
        let mut privileged_positive_count = 0;
        let mut unprivileged_positive_count = 0;

        for dp in data_points.borrow().iter() {
            if dp.privileged {
                privileged_count += 1;
                if dp.predicted {
                    privileged_positive_count += 1;
                }
            } else {
                unprivileged_count += 1;
                if dp.predicted {
                    unprivileged_positive_count += 1;
                }
            }
        }
        (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count)
    })
}

fn calculate_confusion_matrix() -> (u128, u128, u128, u128, u128, u128, u128, u128) {
    DATA_POINTS.with(|data_points| {
        let mut privileged_tp = 0;
        let mut privileged_fp = 0;
        let mut privileged_tn = 0;
        let mut privileged_fn = 0;
        let mut unprivileged_tp = 0;
        let mut unprivileged_fp = 0;
        let mut unprivileged_tn = 0;
        let mut unprivileged_fn = 0;

        for dp in data_points.borrow().iter() {
            if dp.privileged {
                if dp.predicted && dp.target {
                    privileged_tp += 1;
                } else if dp.predicted && !dp.target {
                    privileged_fp += 1;
                } else if !dp.predicted && dp.target {
                    privileged_fn += 1;
                } else {
                    privileged_tn += 1;
                }
            } else {
                if dp.predicted && dp.target {
                    unprivileged_tp += 1;
                } else if dp.predicted && !dp.target {
                    unprivileged_fp += 1;
                } else if !dp.predicted && dp.target {
                    unprivileged_fn += 1;
                } else {
                    unprivileged_tn += 1;
                }
            }
        }
        (privileged_tp, privileged_fp, privileged_tn, privileged_fn, unprivileged_tp, unprivileged_fp, unprivileged_tn, unprivileged_fn)
    })
}

fn calculate_true_positive_false_negative() -> (u128, u128, u128, u128) {
    DATA_POINTS.with(|data_points| {
        let mut privileged_tp = 0;
        let mut privileged_fn = 0;
        let mut unprivileged_tp = 0;
        let mut unprivileged_fn = 0;

        for dp in data_points.borrow().iter() {
            if dp.privileged {
                if dp.predicted && dp.target {
                    privileged_tp += 1;
                } else if !dp.predicted && dp.target {
                    privileged_fn += 1;
                }
            } else {
                if dp.predicted && dp.target {
                    unprivileged_tp += 1;
                } else if !dp.predicted && dp.target {
                    unprivileged_fn += 1;
                }
            }
        }
        (privileged_tp, privileged_fn, unprivileged_tp, unprivileged_fn)
    })
}

