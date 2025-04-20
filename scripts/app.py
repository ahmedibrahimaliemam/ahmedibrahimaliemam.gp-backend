    passing: float
    dribbling: float
    defending: float
    physic: float
    # Add other features expected by the model here...

@app.post("/predict")
def predict_position(player: PlayerInput):
    data_dict = player.dict()
    df = pd.DataFrame([data_dict])

    # Apply scaling if used
    df_scaled = scaler.transform(df)

    # Predict
    pred = model.predict(df_scaled)
    label = encoder.inverse_transform(pred)

    return {"predicted_first_position": label[0]}