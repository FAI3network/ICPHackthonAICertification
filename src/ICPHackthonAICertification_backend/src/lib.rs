#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
use candid::Principal;
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(Clone, Debug)]
pub struct DataPoint {
    data_point_id: u128,
    target: bool,
    privileged: bool,
    predicted: bool,
    timestamp: u64,
}

#[derive(Clone, Debug)]
pub struct Metrics {
    statistical_parity_difference: Option<f32>,
    disparate_impact: Option<f32>,
    average_odds_difference: Option<f32>,
    equal_opportunity_difference: Option<f32>,
}

#[derive(Clone, Debug)]
pub struct Model {
    model_id: u128,
    model_name: String,
    user_id: Principal,
    data_points: Vec<DataPoint>,
    metrics: Metrics,
}

#[derive(Clone, Debug)]
pub struct User {
    user_id: Principal,
    models: HashMap<u128, Model>,
}

thread_local! {
    static USERS: RefCell<HashMap<Principal, User>> = RefCell::new(HashMap::new());
    static NEXT_MODEL_ID: RefCell<u128> = RefCell::new(1);
    static NEXT_DATA_POINT_ID: RefCell<u128> = RefCell::new(1);
}

#[ic_cdk::update]
fn login() {
    let caller = ic_cdk::api::caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        users.entry(caller).or_insert(User {
            user_id: caller,
            models: HashMap::new(),
        });
    });
}

#[ic_cdk::update]
fn add_model(model_name: String) -> u128 {
    let caller = ic_cdk::api::caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user = users.get_mut(&caller).expect("User not logged in");

        NEXT_MODEL_ID.with(|next_model_id| {
            let model_id = *next_model_id.borrow();
            user.models.insert(
                model_id,
                Model {
                    model_id,
                    model_name: model_name.clone(),
                    user_id: caller,
                    data_points: Vec::new(),
                    metrics: Metrics {
                        statistical_parity_difference: None,
                        disparate_impact: None,
                        average_odds_difference: None,
                        equal_opportunity_difference: None,
                    },
                },
            );
            *next_model_id.borrow_mut() += 1;
            model_id
        })
    })
}

#[ic_cdk::update]
fn delete_model(model_id: u128) {
    let caller = ic_cdk::api::caller();
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user = users.get_mut(&caller).expect("User not logged in");
        user.models.remove(&model_id).expect("Model not found or not owned by user");
    });
}

#[ic_cdk::update]
fn add_data_point(model_id: u128, target: bool, privileged: bool, predicted: bool) {
    let caller = ic_cdk::api::caller();
    let timestamp = ic_cdk::api::time();

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user = users.get_mut(&caller).expect("User not logged in");

        let model = user.models.get_mut(&model_id).expect("Model not found or not owned by user");

        NEXT_DATA_POINT_ID.with(|next_data_point_id| {
            let data_point_id = *next_data_point_id.borrow();

            let data_point = DataPoint {
                data_point_id,
                target,
                privileged,
                predicted,
                timestamp,
            };

            model.data_points.push(data_point);
            *next_data_point_id.borrow_mut() += 1;
        });
    });
}

#[ic_cdk::update]
fn calculate_statistical_parity_difference(model_id: u128) -> f32 {
    USERS.with(|users| {
        let users = users.borrow();
        let user = users.get(&ic_cdk::api::caller()).expect("User not logged in");
        let model = user.models.get(&model_id).expect("Model not found or not owned by user");

        let (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count) =
            calculate_group_counts(&model.data_points);

        assert!(privileged_count > 0 && unprivileged_count > 0, "No data for one of the groups");

        let privileged_probability = privileged_positive_count as f32 / privileged_count as f32;
        let unprivileged_probability = unprivileged_positive_count as f32 / unprivileged_count as f32;

        unprivileged_probability - privileged_probability
    })
}

#[ic_cdk::update]
fn calculate_disparate_impact(model_id: u128) -> f32 {
    USERS.with(|users| {
        let users = users.borrow();
        let user = users.get(&ic_cdk::api::caller()).expect("User not logged in");
        let model = user.models.get(&model_id).expect("Model not found or not owned by user");

        let (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count) =
            calculate_group_counts(&model.data_points);

        assert!(privileged_count > 0 && unprivileged_count > 0, "No data for one of the groups");

        let privileged_probability = privileged_positive_count as f32 / privileged_count as f32;
        let unprivileged_probability = unprivileged_positive_count as f32 / unprivileged_count as f32;

        assert!(privileged_probability > 0.0, "Privileged group has no positive outcomes");

        unprivileged_probability / privileged_probability
    })
}

#[ic_cdk::update]
fn calculate_average_odds_difference(model_id: u128) -> f32 {
    USERS.with(|users| {
        let users = users.borrow();
        let user = users.get(&ic_cdk::api::caller()).expect("User not logged in");
        let model = user.models.get(&model_id).expect("Model not found or not owned by user");

        let (privileged_tp, privileged_fp, privileged_tn, privileged_fn, unprivileged_tp, unprivileged_fp, unprivileged_tn, unprivileged_fn) =
            calculate_confusion_matrix(&model.data_points);

        let privileged_tpr = privileged_tp as f32 / (privileged_tp + privileged_fn) as f32;
        let unprivileged_tpr = unprivileged_tp as f32 / (unprivileged_tp + unprivileged_fn) as f32;
        let privileged_fpr = privileged_fp as f32 / (privileged_fp + privileged_tn) as f32;
        let unprivileged_fpr = unprivileged_fp as f32 / (unprivileged_fp + unprivileged_tn) as f32;

        ((unprivileged_fpr - privileged_fpr) + (unprivileged_tpr - privileged_tpr)) / 2.0
    })
}

#[ic_cdk::update]
fn calculate_equal_opportunity_difference(model_id: u128) -> f32 {
    USERS.with(|users| {
        let users = users.borrow();
        let user = users.get(&ic_cdk::api::caller()).expect("User not logged in");
        let model = user.models.get(&model_id).expect("Model not found or not owned by user");

        let (privileged_tp, privileged_fn, unprivileged_tp, unprivileged_fn) =
            calculate_true_positive_false_negative(&model.data_points);

        let privileged_tpr = privileged_tp as f32 / (privileged_tp + privileged_fn) as f32;
        let unprivileged_tpr = unprivileged_tp as f32 / (unprivileged_tp + unprivileged_fn) as f32;

        unprivileged_tpr - privileged_tpr
    })
}

#[ic_cdk::update]
fn calculate_all_metrics(model_id: u128) {
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        let user = users.get_mut(&ic_cdk::api::caller()).expect("User not logged in");
        let model = user.models.get_mut(&model_id).expect("Model not found or not owned by user");

        model.metrics.statistical_parity_difference = Some(calculate_statistical_parity_difference(model_id));
        model.metrics.disparate_impact = Some(calculate_disparate_impact(model_id));
        model.metrics.average_odds_difference = Some(calculate_average_odds_difference(model_id));
        model.metrics.equal_opportunity_difference = Some(calculate_equal_opportunity_difference(model_id));
    });
}


#[ic_cdk::update]
fn add_example_data_points(model_id: u128) {
    add_data_point(model_id, true, true, true);   // TP for privileged
    add_data_point(model_id, false, true, false); // TN for privileged
    add_data_point(model_id, true, false, true);  // TP for unprivileged
    add_data_point(model_id, false, false, false);// TN for unprivileged
    add_data_point(model_id, true, true, true);   // TP for privileged
    add_data_point(model_id, false, true, false); // TN for privileged
    add_data_point(model_id, true, false, true);  // TP for unprivileged
    add_data_point(model_id, true, false, true);  // TP for unprivileged
}

// Helper functions

fn calculate_group_counts(data_points: &Vec<DataPoint>) -> (i128, i128, i128, i128) {
    let mut privileged_count = 0;
    let mut unprivileged_count = 0;
    let mut privileged_positive_count = 0;
    let mut unprivileged_positive_count = 0;

    for point in data_points {
        if point.privileged {
            privileged_count += 1;
            if point.predicted {
                privileged_positive_count += 1;
            }
        } else {
            unprivileged_count += 1;
            if point.predicted {
                unprivileged_positive_count += 1;
            }
        }
    }

    (privileged_count, unprivileged_count, privileged_positive_count, unprivileged_positive_count)
}

fn calculate_confusion_matrix(data_points: &Vec<DataPoint>) -> (i128, i128, i128, i128, i128, i128, i128, i128) {
    let (mut privileged_tp, mut privileged_fp, mut privileged_tn, mut privileged_fn) = (0, 0, 0, 0);
    let (mut unprivileged_tp, mut unprivileged_fp, mut unprivileged_tn, mut unprivileged_fn) = (0, 0, 0, 0);

    for point in data_points {
        match (point.privileged, point.target, point.predicted) {
            (true, true, true) => privileged_tp += 1,
            (true, true, false) => privileged_fn += 1,
            (true, false, true) => privileged_fp += 1,
            (true, false, false) => privileged_tn += 1,
            (false, true, true) => unprivileged_tp += 1,
            (false, true, false) => unprivileged_fn += 1,
            (false, false, true) => unprivileged_fp += 1,
            (false, false, false) => unprivileged_tn += 1,
        }
    }

    (
        privileged_tp, privileged_fp, privileged_tn, privileged_fn,
        unprivileged_tp, unprivileged_fp, unprivileged_tn, unprivileged_fn
    )
}

fn calculate_true_positive_false_negative(data_points: &Vec<DataPoint>) -> (i128, i128, i128, i128) {
    let (mut privileged_tp, mut privileged_fn) = (0, 0);
    let (mut unprivileged_tp, mut unprivileged_fn) = (0, 0);

    for point in data_points {
        match (point.privileged, point.target, point.predicted) {
            (true, true, true) => privileged_tp += 1,
            (true, true, false) => privileged_fn += 1,
            (false, true, true) => unprivileged_tp += 1,
            (false, true, false) => unprivileged_fn += 1,
            _ => {}
        }
    }

    (privileged_tp, privileged_fn, unprivileged_tp, unprivileged_fn)
}

#[ic_cdk::query]
fn check_cycles() -> u64 {
    ic_cdk::api::canister_balance() // Returns the current cycle balance
}

#[ic_cdk::update]
fn stop_if_low_cycles(threshold: u64) {
    let cycles = ic_cdk::api::canister_balance();
    if cycles < threshold {
        ic_cdk::trap("Cycle balance too low, stopping execution to avoid canister deletion.");
    }
}


