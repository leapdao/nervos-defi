use super::*;
use ckb_testtool::{builtin::ALWAYS_SUCCESS, context::Context};
use ckb_tool::ckb_types::{
    bytes::Bytes,
    core::TransactionBuilder,
    packed::*,
    prelude::*,
};

const MAX_CYCLES: u64 = 10_000_000;

#[test]
fn test_basic() {
    // deploy contract
    let mut context = Context::default();
    let contract_bin: Bytes = Loader::default().load_binary("pool");
    let out_point = context.deploy_cell(contract_bin);

    // prepare scripts
    let lock_script = context
        .build_script(&out_point, Default::default())
        .expect("script");
    let lock_script_dep = CellDep::new_builder()
        .out_point(out_point)
        .build();

    let contract_bin_sudt: Bytes = Loader::default().load_binary("sudt");
    let out_point_sudt = context.deploy_cell(contract_bin_sudt);

    // prepare scripts
    let lock_hash: [u8; 32] = lock_script.calc_script_hash().unpack();
    let lock_script_sudt = context
        .build_script(&out_point_sudt, lock_hash.to_vec().into())
        .expect("script");
    let lock_script_dep_sudt = CellDep::new_builder()
        .out_point(out_point_sudt)
        .build();

    let inital_unborrowed_cap = 1000u64;
    let after_unborrowed_cap = 456u64;
    let ckb_tot_sup = 1000u128;
    let cckb_tot_sup = 500u128;
    let ckb_tot_sup_a = 1100u128;
    let cckb_tot_sup_a = 530u128;
    let cckb_minted = 110u128;
    
    let always_success_out_point = context.deploy_cell(ALWAYS_SUCCESS.clone());
        // build lock script
    let lock_script_as = context
        .build_script(&always_success_out_point, Default::default())
        .expect("script");
    let lock_script_dep_as = CellDep::new_builder()
        .out_point(always_success_out_point)
        .build();

    let mut ckb_total_supply = ckb_tot_sup.to_be_bytes().to_vec();
    let cckb_total_supply = cckb_tot_sup.to_be_bytes().to_vec();
    ckb_total_supply.extend(cckb_total_supply);
    // prepare cells
    let input_out_point = context.create_cell(
        CellOutput::new_builder()
            .capacity(inital_unborrowed_cap.pack())
            .lock(lock_script.clone())
            .build(),
        ckb_total_supply.into(),
    );
    let input = CellInput::new_builder()
        .previous_output(input_out_point)
        .build();


    let input_out_point_1 = context.create_cell(
        CellOutput::new_builder()
            .capacity(after_unborrowed_cap.pack())
            .lock(lock_script_as.clone())
            .build(),
        Bytes::new(),
    );
    let input1 = CellInput::new_builder()
        .previous_output(input_out_point_1)
        .build();

    let mut ckb_total_supply_a = ckb_tot_sup_a.to_be_bytes().to_vec();
    let cckb_total_supply_a = cckb_tot_sup_a.to_be_bytes().to_vec();
    ckb_total_supply_a.extend(cckb_total_supply_a); 
    let output_cckb = cckb_minted.to_le_bytes().to_vec().len() as u64;

    let outputs = vec![
        CellOutput::new_builder()
            .capacity(after_unborrowed_cap.pack())
            .lock(lock_script.clone())
            .build(),
        CellOutput::new_builder()
            .capacity(output_cckb.pack())
            .lock(lock_script_as.clone())
            .type_(Some(lock_script_sudt.clone()).pack())
            .build(),
    ];

    let outputs_data : Vec<Bytes> = vec![ckb_total_supply_a.into(), cckb_minted.to_le_bytes().to_vec().into()];

    let witnesses = vec![Bytes::from(vec![0 as u8; 1]); 1];
    // build transaction
    let tx = TransactionBuilder::default()
        .input(input)
        .input(input1)
        .outputs(outputs)
        .outputs_data(outputs_data.pack())
        .cell_dep(lock_script_dep)
        .cell_dep(lock_script_dep_as)
        .cell_dep(lock_script_dep_sudt)
        .witnesses(witnesses.pack())
        .build();
    let tx = context.complete_tx(tx);

    // run
    let cycles = context
        .verify_tx(&tx, MAX_CYCLES)
        .expect("pass verification");
    println!("consume cycles: {}", cycles);
}
