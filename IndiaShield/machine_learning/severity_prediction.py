# ML Model for Disaster Severity Prediction
# This script trains a model to predict disaster severity based on input data.

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Load dataset
data = pd.read_csv('../datasets/disaster_data.csv')

# Preprocess data
X = data[['feature1', 'feature2', 'feature3']]  # Replace with actual feature columns
y = data['severity']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(model, 'severity_model.pkl')
print("Model saved as severity_model.pkl")