#![no_std]
#![no_main]
#![feature(lang_items)]
#![feature(alloc_error_handler)]
#![feature(panic_info_message)]

// Import from `core` instead of from `std` since we are in no-std mode
use core::result::Result;

// Import heap related library from `alloc`
// https://doc.rust-lang.org/alloc/index.html
use alloc::{vec, vec::Vec};

// Import CKB syscalls and structures
// https://nervosnetwork.github.io/ckb-std/riscv64imac-unknown-none-elf/doc/ckb_std/index.html
use ckb_std::{
    ckb_constants::Source,
    ckb_types::{bytes::Bytes, prelude::*},
    debug, default_alloc, entry,
    error::SysError,
    high_level::{load_script, load_tx_hash, load_cell_data, load_cell_capacity, load_cell_type_hash},
    syscalls::load_witness,
};

entry!(entry);
default_alloc!();

/// Program entry
fn entry() -> i8 {
    // Call main function and return error code
    match main() {
        Ok(_) => 0,
        Err(err) => err as i8,
    }
}

/// Error
#[repr(i8)]
enum Error {
    IndexOutOfBound = 1,
    ItemMissing,
    LengthNotEnough,
    Encoding,
    NoSuchStateTransition,
    StateTransitionNotImplemented,
    DataFieldIsTooSmall,
    NoTypeScript,
    WrongTypeScript,
    // Add customized errors here...
}

impl From<SysError> for Error {
    fn from(err: SysError) -> Self {
        use SysError::*;
        match err {
            IndexOutOfBound => Self::IndexOutOfBound,
            ItemMissing => Self::ItemMissing,
            LengthNotEnough(_) => Self::LengthNotEnough,
            Encoding => Self::Encoding,
            Unknown(err_code) => panic!("unexpected sys error {}", err_code),
        }
    }
}

#[derive(Debug)]
enum StateTransition {
    AddLiquidity,
    ClaimLiquidity,
}

static sudt_script_hash: [u8; 32] = [0x48, 0xdb, 0xf5, 0x9b, 0x4c, 0x7e, 0xe1, 0x54, 0x72, 0x38, 0x02, 0x1b, 0x48, 0x69, 0xbc, 0xee, 0xdf, 0x4e, 0xea, 0x6b, 0x43, 0x77, 0x2e, 0x5d, 0x66, 0xef, 0x88, 0x65, 0xb6, 0xae, 0x72, 0x12];

fn get_state_transition() -> Result<StateTransition, Error> {
    let mut wit_buf: [u8; 1] = [0; 1];
    load_witness(&mut wit_buf, 0, 0, Source::Input)?;
    debug!("witness is {:?}", wit_buf);
    match wit_buf[0] {
        0 => Ok(StateTransition::AddLiquidity),
        1 => Ok(StateTransition::ClaimLiquidity),
        _ => Err(Error::NoSuchStateTransition),
    }
}

fn verify_input_0() -> Result<(u128, u128, u64), Error> {
    let data = load_cell_data(0, Source::Input).unwrap();
    debug!("data is {:?}", data);
    if data.len() < 32 {
        return Err(Error::DataFieldIsTooSmall);
    }
    let mut ckb_total_supply_buf = [0u8; 16];
    let mut cckb_total_supply_buf = [0u8; 16];
    ckb_total_supply_buf.copy_from_slice(&data[0..16]);
    cckb_total_supply_buf.copy_from_slice(&data[16..32]);
    let unborrowed_capacity = load_cell_capacity(0, Source::Input)?;
    Ok((u128::from_be_bytes(ckb_total_supply_buf), u128::from_be_bytes(cckb_total_supply_buf), unborrowed_capacity))
}

fn verify_input_1() -> Result<u64, Error> {
    let deposit_capacity = load_cell_capacity(1, Source::Input)?;
    // should we check for 0 capacity?
    Ok(deposit_capacity)
}

fn verify_output_0() -> Result<(u128, u128, u64), Error> {
    let data = load_cell_data(0, Source::Output).unwrap();
    debug!("data is {:?}", data);
    if data.len() < 32 {
        return Err(Error::DataFieldIsTooSmall);
    }
    let mut ckb_total_supply_buf = [0u8; 16];
    let mut cckb_total_supply_buf = [0u8; 16];
    ckb_total_supply_buf.copy_from_slice(&data[0..16]);
    cckb_total_supply_buf.copy_from_slice(&data[16..32]);
    let unborrowed_capacity = load_cell_capacity(0, Source::Output)?;
    Ok((u128::from_be_bytes(ckb_total_supply_buf), u128::from_be_bytes(cckb_total_supply_buf), unborrowed_capacity))
}

fn verify_output_1() -> Result<u128, Error> {
    let data = load_cell_data(1, Source::Output).unwrap();
    let mut cckb_minted_buf = [0u8; 16];
    cckb_minted_buf.copy_from_slice(&data[0..16]);
    let cckb_minted = u128::from_le_bytes(cckb_minted_buf);
    let typeHash = load_cell_type_hash(1, Source::Output)?;
    match typeHash {
        Some(hash) => if hash == sudt_script_hash {
            return Ok(cckb_minted);
        } else {
            return Err(Error::WrongTypeScript);
        }
        None => Err(Error::NoTypeScript),
    }
}

fn verify_add_liquidity() -> Result<(), Error> {
    //check num inputs/outputs
    let (ckb_total_supply, cckb_total_supply, unborrowed_capacity) = verify_input_0()?;
    debug!("Nums are {:?} {:?} {:?}", ckb_total_supply, cckb_total_supply, unborrowed_capacity);
    let deposit_capacity = verify_input_1()?;
    debug!("Deposit capacity is  {:?}", deposit_capacity);
    let (ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a) = verify_output_0()?;
    debug!("Nums are {:?} {:?} {:?}", ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a);
    Ok(())
}

fn main() -> Result<(), Error> {
    // remove below examples and write your code here

    // let script = load_script()?;
    // let args: Bytes = script.args().unpack();
    // debug!("script args is {:?}", args);

    // let tx_hash = load_tx_hash()?;
    // debug!("tx hash is {:?}", tx_hash);

    // let _buf: Vec<_> = vec![0u8; 32];

    let state_transition = get_state_transition()?;
    debug!("State transition is {:?}", state_transition);

    match state_transition {
        StateTransition::AddLiquidity => verify_add_liquidity(),
        StateTransition::ClaimLiquidity => Err(Error::NoSuchStateTransition),
    }

}
