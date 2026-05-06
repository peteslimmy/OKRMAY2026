-- Add key_results for 2025 objectives
-- Q1
INSERT INTO key_results (objective_id, title, progress, status) VALUES
('7cd83d16-fd8d-44c6-a8ef-f3e0c3150945', 'REVENUE', 0, 'Green'),
('7cd83d16-fd8d-44c6-a8ef-f3e0c3150945', 'STRUCTURAL REFORMS', 0, 'Amber'),
('7cd83d16-fd8d-44c6-a8ef-f3e0c3150945', 'DATA-DRIVEN INNOVATION', 0, 'Green');

-- Q2
INSERT INTO key_results (objective_id, title, progress, status) VALUES
('85509c69-852a-4e58-9c94-1655f48528cf', 'REVENUE', 0, 'Green'),
('85509c69-852a-4e58-9c94-1655f48528cf', 'TEAM STRUCTURE', 0, 'Amber'),
('85509c69-852a-4e58-9c94-1655f48528cf', 'CLIENT-CENTRIC', 0, 'Green');

-- Q3
INSERT INTO key_results (objective_id, title, progress, status) VALUES
('bcd06e51-df2c-4d11-b80c-70c53fd86d42', 'REVENUE', 0, 'Green'),
('bcd06e51-df2c-4d11-b80c-70c53fd86d42', 'STANDARDIZATION', 0, 'Amber'),
('bcd06e51-df2c-4d11-b80c-70c53fd86d42', 'SERVICE DELIVERY', 0, 'Green');

-- Q4
INSERT INTO key_results (objective_id, title, progress, status) VALUES
('0fb39b00-81b6-434d-b349-ccf2094f2563', 'REVENUE', 0, 'Green'),
('0fb39b00-81b6-434d-b349-ccf2094f2563', 'PRODUCT EXCELLENCE', 0, 'Amber'),
('0fb39b00-81b6-434d-b349-ccf2094f2563', 'ALIGNMENT', 0, 'Green'),
('0fb39b00-81b6-434d-b349-ccf2094f2563', 'STAKEHOLDER', 0, 'Green');

SELECT 'Key results added!' as result;