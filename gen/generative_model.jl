using Gen

@gen function generate_table_world(world_dims)
    
    # Defaults are 1000, 1000, 1000
    x_range, y_range, z_range = world_dims[1], world_dims[2], world_dims[3]
    
    # Initialize the world
    world = []
    
    largest_block_volume = round(Int, x_range / 50) ^ 3
    
    largest_block_mass = 10
    
    function make_table()
        shape = bernoulli(0.5) ? "square" : "rect"
        # "round(Int, x)" can be simply replaced by "//"?
        dim_x ~ uniform_discrete(round(Int, x_range / 4), round(Int, x_range / 4 * 3))
        height ~ uniform_discrete(round(Int, y_range / 4), round(Int, y_range / 4 * 3))
        dim_z ~ uniform_discrete(round(Int, z_range / 4), round(Int, z_range / 4 * 3))
        mass = 100 # not stochastic for now
        if shape == "square"
            dim_z = dim_x
        end
        
        table = Dict(
            "object_type" => "table",
            "base_shape" => ["table"],
            "abs_spatial" => Dict("x" => x_range / 2, "y" => height / 2, "z"=> z_range / 2),
            "dims" => [dim_x, height, dim_z],
            "mass" =>  mass,
            "color" => "white" # string for now, change to rgb later
        )
        
        return table
    end
    table = make_table()
    push!(world, table)
    
    
    # Currently, "make_stack" and "make_block" do not account for overlapping situations
    # Also, I need to think about the hierarchical relationships between blocks and stacks
#     function make_stack(table) # Currently, all blocks in a stack are of the same size
        
        
#     end
    
#     num_stacks ~ uniform(0, 5)
    
#     for i in 1:num_stacks
#         push!(world, make_stack(table))
#     end
    
    function make_block(table)
#         shape = bernoulli(0.5) ? "cube" : "ball"
        shape = "cube"
        color = bernoulli(0.5) ? "red" : "yellow"
        dim ~ uniform_discrete(round(Int, x_range // 100), round(Int, x_range / 50))
        volume = dim ^ 3
        mass = volume / largest_block_volume * largest_block_mass    
        table_top = [
            [table["abs_spatial"]["x"] - table["dims"][1] / 2, 
             table["abs_spatial"]["x"] + table["dims"][1] / 2],
            [table["abs_spatial"]["z"] - table["dims"][3] / 2, 
             table["abs_spatial"]["z"] + table["dims"][3] / 2]
        ] # [[x_start, x_end], [z_start, z_end]]
        loc_x ~ uniform(table_top[1][1], table_top[1][2])
        loc_y = table["dims"][2] + dim / 2
        loc_z ~ uniform(table_top[2][1], table_top[2][2])
        block = Dict(
            "object_type" => "block",
            "base_shape" => [shape],
            "abs_spatial" => Dict("x"=>loc_x, "y"=>loc_y, "z"=>loc_z),
            "dims" => [dim, dim, dim],
            "color" => color,
            "volume" => volume,
            "mass" => mass
        )
        return block
    end
    
    num_single_blocks ~ uniform(0, 10)
    
    for i in 1:num_single_blocks
        push!(world, make_block(table))
    end
    
    return world
end