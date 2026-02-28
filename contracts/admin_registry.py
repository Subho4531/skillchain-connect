from pyteal import *
from beaker import *

app = Application("AdminRegistry")

@app.external
def initialize(platform_admin_addr: abi.Address, college_admin_addr: abi.Address) -> Expr:
    """Initialize contract with admin addresses"""
    return Seq(
        Assert(Txn.sender() == Global.creator_address()),
        App.globalPut(Bytes("platform_admin"), platform_admin_addr.get()),
        App.globalPut(Bytes("college_admin"), college_admin_addr.get())
    )

@app.external
def update_college_admin(new_admin: abi.Address) -> Expr:
    """Update college admin - only platform admin can call"""
    return Seq(
        Assert(Txn.sender() == App.globalGet(Bytes("platform_admin"))),
        App.globalPut(Bytes("college_admin"), new_admin.get())
    )

@app.external(read_only=True)
def get_platform_admin(*, output: abi.Address) -> Expr:
    """Get platform admin address"""
    return output.set(App.globalGet(Bytes("platform_admin")))

@app.external(read_only=True)
def get_college_admin(*, output: abi.Address) -> Expr:
    """Get college admin address"""
    return output.set(App.globalGet(Bytes("college_admin")))


if __name__ == "__main__":
    spec = app.build()
    # Set correct schema
    spec.global_state_schema.num_byte_slices = 2
    spec.global_state_schema.num_uints = 0
    spec.export("./artifacts")
