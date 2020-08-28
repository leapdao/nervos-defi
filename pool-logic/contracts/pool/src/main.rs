#![no_std]
#![no_main]
#![feature(lang_items)]
#![feature(alloc_error_handler)]
#![feature(panic_info_message)]

// Import from `core` instead of from `std` since we are in no-std mode
use core::result::Result;

// Import CKB syscalls and structures
// https://nervosnetwork.github.io/ckb-std/riscv64imac-unknown-none-elf/doc/ckb_std/index.html
use ckb_std::{
    ckb_constants::Source,
    debug, default_alloc, entry,
    error::SysError,
    high_level::{
        load_cell_capacity, load_cell_data, load_cell_type, load_cell_lock_hash, load_script_hash
    },
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
    ItemMissing = 2,
    LengthNotEnough = 3,
    Encoding = 4,
    NoSuchStateTransition = 5,
    StateTransitionNotImplemented = 6,
    DataFieldIsTooSmall = 7,
    NoTypeScript = 8,
    WrongTypeScript = 9,
    WrongAfterCapacity = 10,
    WrongCCKBSupplyAfter = 11,
    WrongCKBSupplyAfter = 12,
    WrongAmountMinted = 13,
    WrongAmountReleased = 14,
    WrongLockScript = 15,
    WrongSudtArgs = 16,
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
    Borrow,
    Return,
    Liquidate,
}

static SUDT_SCRIPT_HASH: [u8; 32] = [
    0x48, 0xdb, 0xf5, 0x9b, 0x4c, 0x7e, 0xe1, 0x54, 0x72, 0x38, 0x02, 0x1b, 0x48, 0x69, 0xbc, 0xee,
    0xdf, 0x4e, 0xea, 0x6b, 0x43, 0x77, 0x2e, 0x5d, 0x66, 0xef, 0x88, 0x65, 0xb6, 0xae, 0x72, 0x12,
];

fn get_state_transition() -> Result<StateTransition, Error> {
    let mut wit_buf: [u8; 1] = [0; 1];
    load_witness(&mut wit_buf, 0, 0, Source::Input)?;
    debug!("witness is {:?}", wit_buf);
    match wit_buf[0] {
        0 => Ok(StateTransition::AddLiquidity),
        1 => Ok(StateTransition::ClaimLiquidity),
        2 => Ok(StateTransition::Borrow),
        3 => Ok(StateTransition::Return),
        4 => Ok(StateTransition::Liquidate),
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
    Ok((
        u128::from_be_bytes(ckb_total_supply_buf),
        u128::from_be_bytes(cckb_total_supply_buf),
        unborrowed_capacity,
    ))
}

fn verify_lock_input_1() -> Result<u64, Error> {
    let deposit_capacity = load_cell_capacity(1, Source::Input)?;
    // should we check for 0 capacity?
    Ok(deposit_capacity)
}

fn verify_unlock_input_1() -> Result<u128, Error> {
    // load amount
    let data = load_cell_data(1, Source::Input).unwrap();
    let mut cckb_returned_buf = [0u8; 16];
    cckb_returned_buf.copy_from_slice(&data[0..16]);
    let cckb_returned = u128::from_le_bytes(cckb_returned_buf);

    // verify SUDT type
    let type_script = load_cell_type(1, Source::Input)?;
    match type_script {
        Some(script) => {
            debug!("Type hash {:?}", script.code_hash());
            if script.code_hash().raw_data() == SUDT_SCRIPT_HASH[..].into() {
                // also checking script args
                let script_hash = load_script_hash().unwrap();
                if script.args().raw_data() == script_hash[..].into() {
                    return Ok(cckb_returned);
                } else {
                    return Err(Error::WrongSudtArgs);
                }
            } else {
                return Err(Error::WrongTypeScript);
            }
        }
        None => Err(Error::NoTypeScript),
    }

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
    Ok((
        u128::from_be_bytes(ckb_total_supply_buf),
        u128::from_be_bytes(cckb_total_supply_buf),
        unborrowed_capacity,
    ))
}

fn verify_lock_output_1() -> Result<u128, Error> {
    let data = load_cell_data(1, Source::Output).unwrap();
    let mut cckb_minted_buf = [0u8; 16];
    cckb_minted_buf.copy_from_slice(&data[0..16]);
    let cckb_minted = u128::from_le_bytes(cckb_minted_buf);
    let type_script = load_cell_type(1, Source::Output)?;
    match type_script {
        Some(script) => {
            debug!("Type hash {:?}", script.code_hash());
            if script.code_hash().raw_data() == SUDT_SCRIPT_HASH[..].into() {
                 return Ok(cckb_minted);
            } else {
                return Err(Error::WrongTypeScript);
            }
        }
        None => Err(Error::NoTypeScript),
    }
}

fn verify_unlock_output_1() -> Result<u64, Error> {
    let unlock_capacity = load_cell_capacity(1, Source::Output)?;
    Ok(unlock_capacity)
}

fn calculate_deposit_amount(deposit_capacity : u64) -> Result<u128, Error> {
    let mut outputs_capacity: u128 = 0;
    let mut inputs_capacity: u128 = 0;
    for i in 0.. {
        if i == 1 {
            // we ignore the capacity of the Sudt output here
            continue;
        }
        outputs_capacity += match load_cell_capacity(i, Source::Output) {
            Ok(outputs_capacity) => (outputs_capacity as u128),
            Err(SysError::IndexOutOfBound) => break,
            Err(err) => return Err(err.into()),
        }
    }
    for i in 0.. {
        inputs_capacity += match load_cell_capacity(i, Source::Input) {
            Ok(inputs_capacity) => (inputs_capacity as u128),
            Err(SysError::IndexOutOfBound) => break,
            Err(err) => return Err(err.into()),
        }
    }
    debug!(" numburs {:?} {:?} {:?}", deposit_capacity, inputs_capacity, outputs_capacity);
    Ok((deposit_capacity as u128) - (inputs_capacity - outputs_capacity))
}

fn verify_lock_liquidity() -> Result<(), Error> {
    //check num inputs/outputs
    let (ckb_total_supply, cckb_total_supply, unborrowed_capacity) = verify_input_0()?;
    debug!(
        "Lock Input 0: {:?} CKB-TS, {:?} cCKB-TS, {:?} unborrowed",
        ckb_total_supply, cckb_total_supply, unborrowed_capacity
    );
    let deposit_capacity = verify_lock_input_1()?;
    debug!("Unlock Input 1: {:?} deposit capacity", deposit_capacity);
    let (ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a) = verify_output_0()?;
    debug!(
        "Lock Output 0: {:?} CKB-TS, {:?}, cCKB-TS, {:?} unborrowed",
        ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a
    );
    let cckb_minted = verify_lock_output_1()?;
    debug!("Lock Output 1: {:?} minted cCKB", cckb_minted);

    let deposit_amount : u128 = calculate_deposit_amount(deposit_capacity)?;

    let x : u128 = (deposit_amount as u128) * cckb_total_supply / ckb_total_supply;
    debug!("Lock - x is {:?}", x);

    if !(unborrowed_capacity_a == unborrowed_capacity + (deposit_amount as u64)) {
        return Err(Error::WrongAfterCapacity);
    }

    if !(cckb_total_supply_a == cckb_total_supply + x) {
        return Err(Error::WrongCCKBSupplyAfter);
    }

    if !(ckb_total_supply_a == ckb_total_supply + deposit_amount) {
        return Err(Error::WrongCKBSupplyAfter);
    }

    if !(cckb_minted == x) {
        return Err(Error::WrongAmountMinted);
    }

    
    Ok(())
}

fn verify_unlock_liquidity() -> Result<(), Error> {
    //check num inputs/outputs
    let (ckb_total_supply, cckb_total_supply, unborrowed_capacity) = verify_input_0()?;
    debug!(
        "Unlock Input 0: {:?} CKB-TS, {:?} cCKB-TS, {:?} unborrowed",
        ckb_total_supply, cckb_total_supply, unborrowed_capacity
    );
    let unlock_amount = verify_unlock_input_1()?;
    debug!("Unlock Input 1: {:?} returned cCKB", unlock_amount);
    let (ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a) = verify_output_0()?;
    debug!(
        "Unlock Output 0: {:?} CKB-TS, {:?}, cCKB-TS, {:?} unborrowed",
        ckb_total_supply_a, cckb_total_supply_a, unborrowed_capacity_a
    );
    let ckb_released = verify_unlock_output_1()?;
    debug!("Unlock Output 1: {:?} released CKB", ckb_released);

    let y : u128 = unlock_amount * ckb_total_supply / cckb_total_supply;
    debug!("Unlock - y is {:?}", y);

    if !(unborrowed_capacity_a == unborrowed_capacity - (y as u64)) {
        return Err(Error::WrongAfterCapacity);
    }

    if !(cckb_total_supply_a == cckb_total_supply - unlock_amount) {
        return Err(Error::WrongCCKBSupplyAfter);
    }

    if !(ckb_total_supply_a == ckb_total_supply - y) {
        return Err(Error::WrongCKBSupplyAfter);
    }

    if !((ckb_released as u128) == y) {
        return Err(Error::WrongAmountReleased);
    }

    Ok(())
}

fn verify_borrow() -> Result<(), Error> {
    return Err(Error::StateTransitionNotImplemented);
}

fn verify_return() -> Result<(), Error> {
    return Err(Error::StateTransitionNotImplemented);
}

fn verify_liquidate() -> Result<(), Error> {
    return Err(Error::StateTransitionNotImplemented);
}

fn verify_pool_logic() -> Result<(), Error> {
    let script_hash = load_script_hash().unwrap();
    // verify first input
    let in_lock_script = load_cell_lock_hash(0, Source::Input)?;
    if in_lock_script != script_hash {
        return Err(Error::WrongLockScript);
    }
    // verify first output
    let out_lock_script = load_cell_lock_hash(0, Source::Output)?;
    if out_lock_script != script_hash {
        return Err(Error::WrongLockScript);
    }
    Ok(())
}

fn main() -> Result<(), Error> {

    verify_pool_logic()?;

    let state_transition = get_state_transition()?;
    debug!("State transition is {:?}", state_transition);

    match state_transition {
        StateTransition::AddLiquidity => verify_lock_liquidity(),
        StateTransition::ClaimLiquidity => verify_unlock_liquidity(),
        StateTransition::Borrow => verify_borrow(),
        StateTransition::Return => verify_return(),
        StateTransition::Liquidate => verify_liquidate(),
    }
}
